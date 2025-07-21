import type { Request, Response, NextFunction } from "express";
import {
  type Result,
  type ErrorResult,
  type PipelineContext,
  type PipelineFn,
  type PipelineOptions,
  type ValidationSchemas,
  type ValidatedMetadata,
  ok,
  Ok,
  Err,
  isOk,
  isErr,
  fromError,
} from "./result";

function handlePipelineError(error: unknown, stepName?: string): ErrorResult {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  if (error instanceof Error) {
    return fromError(error);
  }

  return Err(
    errorMessage,
    500,
    "PipelineError",
    stepName ? `Pipeline step: ${stepName}` : undefined
  );
}

function sendResponse<T>(
  result: Result<T>,
  res: Response,
  options: PipelineOptions
) {
  if (res.headersSent) return;

  if (isOk(result)) {
    const {
      data,
      statusCode = options.successStatus || 200,
      metadata,
    } = result[1];

    // Set headers from metadata
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (key.startsWith("header_")) {
          res.setHeader(key.replace("header_", ""), String(value));
        } else if (key.startsWith("cookie_")) {
          const cookieName = key.replace("cookie_", "");
          const cookieValue = typeof value === "object" ? value : { value };
          res.cookie(cookieName, cookieValue.value, cookieValue.options || {});
        }
      });
    }

    if (options.enableLogging) {
      console.log(`✓ Success response: ${statusCode}`, { data });
    }

    // Check if data has view property (for rendering templates)
    if (
      data &&
      typeof data === "object" &&
      "view" in data &&
      typeof data.view === "string"
    ) {
      const templateName = data.view;
      const templateData = (data as any).data || {};
      res.status(statusCode).render(templateName, templateData);
    }
    // Check if data has redirect property
    else if (
      data &&
      typeof data === "object" &&
      "redirect" in data &&
      typeof data.redirect === "string"
    ) {
      res.status(statusCode || 302).redirect(data.redirect);
    } else {
      res.status(statusCode).json(data);
    }
  } else {
    const { message, statusCode, name, stack } = result[1];

    if (options.enableLogging) {
      console.error(`✗ Error response: ${statusCode}`, {
        message,
        name,
        stack,
      });
    }

    res.status(statusCode).json({
      error: message,
      name,
      stack: process.env.NODE_ENV === "development" ? stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}

export function wrapMiddleware<T>(
  middleware: (req: Request, res: Response, next: NextFunction) => void,
  name?: string
): PipelineFn<T> {
  return async (data: T, metadata: PipelineContext & Record<string, any>) => {
    return new Promise<Result<T>>((resolve) => {
      // Use req and res from metadata
      const { req, res } = metadata;
      const defaultErrorName = `${middleware.name} Middleware Error`;

      try {
        middleware(req, res, (err?: any) => {
          if (err) {
            // Handle different error types
            if (err instanceof Error) {
              resolve(fromError(err));
            } else if (typeof err === "string") {
              resolve(Err(err, 500, defaultErrorName));
            } else if (typeof err === "object" && err !== null) {
              resolve(
                Err(
                  err.message || err.msg || String(err),
                  err.statusCode || err.status || 500,
                  err.name || err.code || defaultErrorName,
                  err.stack
                )
              );
            } else {
              // Fallback for any other type
              resolve(Err(String(err), 500, defaultErrorName));
            }
          } else {
            resolve(Ok(data));
          }
        });
      } catch (err) {
        resolve(handlePipelineError(err, name));
      }
    });
  };
}

export function compose<TSchemas extends Record<string, any>>(
  pipeline: Array<PipelineFn<any, any, ValidatedMetadata<TSchemas>>>,
  options: PipelineOptions & { validationSchemas: Record<string, any> }
): (req: Request, res: Response) => Promise<void>;
export function compose(
  pipeline: Array<PipelineFn<any, any>>,
  options?: PipelineOptions
): (req: Request, res: Response) => Promise<void>;
export function compose(
  pipeline: Array<PipelineFn<any, any>>,
  options: PipelineOptions = {}
) {
  return async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    if (options.enableLogging) {
      console.log(
        `🚀 Starting pipeline for ${req.method} ${req.path}, it has ${pipeline.length} steps in total`
      );
    }
    // Parse request data using validation schemas if provided
    let currentResult: Result<null>;
    try {
      const body = options.validationSchemas?.body
        ? options.validationSchemas.body.parse(req.body)
        : req.body;
      console.log("Parsed body:", body);
      const query = options.validationSchemas?.query
        ? options.validationSchemas.query.parse(req.query)
        : req.query;

      const params = options.validationSchemas?.params
        ? options.validationSchemas.params.parse(req.params)
        : req.params;

      const cookies = options.validationSchemas?.cookies
        ? options.validationSchemas.cookies.parse(req.cookies)
        : req.cookies;

      const headers = req.headers;

      currentResult = [
        ok,
        {
          data: null,
          metadata: { body, query, params, cookies, headers, req, res },
        },
      ];
    } catch (error) {
      // Handle validation errors
      const validationError =
        error instanceof Error
          ? fromError(error, 400)
          : Err("Validation failed", 400, "ValidationError");

      sendResponse(validationError, res, options);
      return; // Early return on validation error
    }
    // Set up timeout if specified
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        if (!res.headersSent) {
          sendResponse(Err("Request timeout", 408), res, options);
        }
      }, options.timeout);
    }

    try {
      for (let i = 0; i < pipeline.length; i++) {
        if (res.headersSent) break;

        const step = pipeline[i];
        if (!step) continue;

        const stepName = step.name || `step-${i}`;

        if (isErr(currentResult)) {
          if (options.enableLogging) {
            console.error(`❌ Pipeline stopped at ${stepName} due to error`);
          }
          break;
        }

        try {
          const stepResult: Awaited<ReturnType<typeof step>> = await step(
            currentResult[1].data,
            currentResult[1].metadata as PipelineContext & Record<string, any>
          );

          if (isErr(stepResult)) {
            currentResult = stepResult;
            break;
          }

          // Merge metadata from previous steps
          const { body, query, params, cookies, ...rest } =
            stepResult[1].metadata;

          const mergedMetadata = {
            ...currentResult[1].metadata,
            ...rest,
          } as PipelineContext & Record<string, any>;

          const statusCode: number | undefined =
            stepResult[1].statusCode || currentResult[1].statusCode;

          if (statusCode) {
            currentResult = Ok(stepResult[1].data, mergedMetadata, statusCode);
          } else {
            currentResult = Ok(stepResult[1].data, mergedMetadata);
          }

          if (options.enableLogging) {
            console.log(`✓ Completed ${stepName}`);
          }

          // If step returns a status code, send response immediately
          if (stepResult[1].statusCode) {
            sendResponse(currentResult, res, options);
            break;
          }
        } catch (error) {
          currentResult = handlePipelineError(error, stepName);
          break;
        }
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    // Send final response if not already sent
    if (!res.headersSent) {
      sendResponse(currentResult, res, options);
    }

    if (options.enableLogging) {
      const duration = Date.now() - startTime;
      console.log(`🏁 Pipeline completed in ${duration}ms`, {
        success: isOk(currentResult),
      });
    }
  };
}
