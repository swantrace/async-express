export const ok = Symbol("ok");
export const error = Symbol("error");

export type OkResult<T> = readonly [
  typeof ok,
  Readonly<{ data: T; statusCode?: number; metadata: Record<string, any> }>
];

export type ErrorResult = readonly [
  typeof error,
  Readonly<{
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  }>
];

export type Result<T> = OkResult<T> | ErrorResult;

export const Ok = <T>(
  data: T,
  arg2?: Record<string, any> | number,
  arg3?: number
): OkResult<T> => {
  let metadata: Record<string, any> = {};
  let statusCode: number | undefined;

  if (typeof arg2 === "number") {
    statusCode = arg2;
  } else {
    metadata = arg2 || {};
    statusCode = arg3;
  }

  return [ok, { data, metadata, statusCode }] as const;
};

export const Err = (
  message: string,
  statusCode: number,
  details?: Record<string, any>
): ErrorResult => {
  return [error, { message, statusCode, details }] as const;
};
