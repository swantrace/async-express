import { z } from "zod";
import type { Request, Response } from "express";

export const ok = Symbol("ok");
export const error = Symbol("error");

export interface PipelineContext {
  body: any;
  query: any;
  params: any;
  cookies: any;
  headers: any;
  req: Request;
  res: Response;
  renderTemplate?: string; // Template name to render
  redirect?: string; // URL to redirect to
}

export interface OkData<
  T,
  TMetadata extends PipelineContext = PipelineContext
> {
  readonly data: T;
  readonly metadata: Partial<PipelineContext> & Record<string, any>;
  readonly statusCode?: number;
}

export interface ErrorData {
  readonly message: string;
  readonly statusCode: number;
  readonly name?: string;
  readonly stack?: string;
}

export type OkResult<
  T,
  TMetadata extends PipelineContext = PipelineContext
> = readonly [typeof ok, OkData<T, TMetadata>];
export type ErrorResult = readonly [typeof error, ErrorData];
export type Result<T, TMetadata extends PipelineContext = PipelineContext> =
  | OkResult<T, TMetadata>
  | ErrorResult;

// Helper type to infer types from validation schemas
type InferSchemaType<T> = T extends z.ZodTypeAny ? z.infer<T> : any;

// Type for validated metadata based on schemas
export type ValidatedMetadata<TSchemas extends Record<string, any> = any> = {
  body: TSchemas["body"] extends z.ZodTypeAny ? z.infer<TSchemas["body"]> : any;
  query: TSchemas["query"] extends z.ZodTypeAny
    ? z.infer<TSchemas["query"]>
    : any;
  params: TSchemas["params"] extends z.ZodTypeAny
    ? z.infer<TSchemas["params"]>
    : any;
  cookies: TSchemas["cookies"] extends z.ZodTypeAny
    ? z.infer<TSchemas["cookies"]>
    : any;
  headers: any;
  req: Request;
  res: Response;
};

// Enhanced pipeline function with better type safety
export type PipelineFn<
  TIn,
  TOut = TIn,
  TMetadata extends PipelineContext = PipelineContext
> = (
  data: TIn,
  metadata: TMetadata & Record<string, any>
) => Promise<Result<TOut, TMetadata>> | Result<TOut, TMetadata>;

export interface ValidationSchemas {
  readonly body?: z.ZodTypeAny;
  readonly query?: z.ZodTypeAny;
  readonly params?: z.ZodTypeAny;
  readonly cookies?: z.ZodTypeAny;
}

export interface PipelineOptions {
  readonly successStatus?: number;
  readonly enableLogging?: boolean;
  readonly timeout?: number;
  readonly validationSchemas?: Record<string, any>;
}

// Improved Ok constructor with better overloads
export function Ok<T>(data: T): OkResult<T>;
export function Ok<T>(data: T, statusCode: number): OkResult<T>;
export function Ok<T, TMetadata extends PipelineContext>(
  data: T,
  metadata: Record<string, any>
): OkResult<T, TMetadata>;
export function Ok<T, TMetadata extends PipelineContext>(
  data: T,
  metadata: Record<string, any>,
  statusCode: number
): OkResult<T, TMetadata>;
export function Ok<T, TMetadata extends PipelineContext = PipelineContext>(
  data: T,
  metadataOrStatusCode?: Record<string, any> | number,
  statusCode?: number
): OkResult<T, TMetadata> {
  if (typeof metadataOrStatusCode === "number") {
    // Only statusCode provided, no metadata
    return [
      ok,
      {
        data,
        metadata: {},
        statusCode: metadataOrStatusCode,
      },
    ] as const;
  }

  if (!metadataOrStatusCode) {
    // No metadata provided
    return [
      ok,
      {
        data,
        metadata: {},
        statusCode,
      },
    ] as const;
  }

  return [
    ok,
    {
      data,
      metadata: metadataOrStatusCode,
      statusCode,
    },
  ] as const;
}

export const Err = (
  message: string,
  statusCode: number = 500,
  name?: string,
  stack?: string
): ErrorResult => {
  return [error, { message, statusCode, name, stack }] as const;
};

// Helper to create error from Error instance
export const fromError = (err: Error, statusCode?: number): ErrorResult => {
  const code =
    statusCode || (err as any).status || (err as any).statusCode || 500;
  return Err(err.message, code, err.name, err.stack);
};

export const isOk = <T, TMetadata extends PipelineContext = PipelineContext>(
  result: Result<T, TMetadata>
): result is OkResult<T, TMetadata> => result[0] === ok;

export const isErr = <T, TMetadata extends PipelineContext = PipelineContext>(
  result: Result<T, TMetadata>
): result is ErrorResult => result[0] === error;

// Common error constructors
export const BadRequest = (message: string) => Err(message, 400, "BadRequest");

export const Unauthorized = (message: string = "Unauthorized") =>
  Err(message, 401, "Unauthorized");

export const Forbidden = (message: string = "Forbidden") =>
  Err(message, 403, "Forbidden");

export const NotFound = (message: string = "Not Found") =>
  Err(message, 404, "NotFound");

export const InternalError = (message: string) =>
  Err(message, 500, "InternalError");
