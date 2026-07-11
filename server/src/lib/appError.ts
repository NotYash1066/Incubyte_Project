export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError(404, message);
}

export function badRequest(message: string): AppError {
  return new AppError(400, message);
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(401, message);
}
