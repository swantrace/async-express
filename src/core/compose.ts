import type { Request, Response, NextFunction } from "express";
import { type Result, ok, error, type OkResult, Ok, Err } from "./result";

// Updated PipelineFn to support different input and output types
export type PipelineFn<TIn, TOut = TIn> = (
  payload: OkResult<TIn>[1],
  req: Request,
  res: Response
) => Promise<Result<TOut>>;

export interface PipelineOptions<T> {
  successStatus?: number;
  initialData?: Partial<T>;
}

function matchResult<T>(result: Result<T>, res: Response) {
  if (result[0] === ok) {
    const [_, { data, statusCode = 200, metadata }] = result;
    console.log(`Sending response with status: ${statusCode}`);
    // set metadata of which key is started with header_ to headers
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (key.startsWith("header_")) {
          res.setHeader(key.replace("header_", ""), value);
        }
      });
    }
    console.log("data: ", data);
    res.status(statusCode).send(data);
  } else {
    const [_, { message, statusCode, details }] = result;
    console.log(`Error response with status: ${statusCode}`);
    return res.status(statusCode).json({ error: message, details });
  }
}

export function wrapMiddleware<T>(
  middleware: (req: Request, res: Response, next: NextFunction) => void
): PipelineFn<T> {
  return (payload, req, res) =>
    new Promise<Result<T>>((resolve) => {
      try {
        middleware(req, res, (err?: any) => {
          if (err) {
            // Handle errors passed to next(err)
            resolve(Err(err.message || "Middleware error", 500));
          } else if (!res.headersSent) {
            // If response was not sent by middleware, resolve with current state
            const statusCode = payload.statusCode
              ? res.statusCode
                ? res.statusCode
                : payload.statusCode
              : undefined;

            resolve(Ok(payload.data, payload.metadata, statusCode));
          }
          // If headers were sent (e.g., middleware called res.send), resolve is skipped as response is handled
        });
      } catch (err: unknown) {
        // Properly type the caught error and handle it safely
        const errorMessage =
          err instanceof Error ? err.message : "Unexpected middleware error";

        resolve(Err(errorMessage, 500));
      }
    });
}

export function compose<T>(
  fns: Array<PipelineFn<any, Partial<T>>>,
  options: PipelineOptions<T> = { successStatus: 200 }
) {
  return async (req: Request, res: Response) => {
    // Start with whatever partial data we have
    let preResult: OkResult<any> =
      options.initialData !== undefined
        ? Ok(options.initialData)
        : Ok(null as unknown as Partial<T>);

    for (const fn of fns) {
      const result = await fn(preResult[1], req, res).catch((err) =>
        Err(err.message || "Internal error", 500)
      );

      if (result[0] === error) {
        if (!res.headersSent) {
          matchResult(result, res);
        }
        return;
      }
      // Merge previous data with new data for partial updates
      preResult = [
        result[0],
        {
          data:
            typeof result[1].data === "object" && result[1].data !== null
              ? { ...preResult[1].data, ...result[1].data } // Merge objects
              : result[1].data, // Replace with non-object values
          metadata: { ...preResult[1].metadata, ...result[1].metadata },
          statusCode: result[1].statusCode || preResult[1].statusCode,
        },
      ] as OkResult<any>;

      if (result[0] === ok && result[1].statusCode) {
        if (!res.headersSent) {
          matchResult(preResult, res);
        }
        return;
      }

      if (res.headersSent) return;
    }

    if (!res.headersSent) {
      res.status(options.successStatus ?? 200).json(preResult[1].data);
    }
  };
}
