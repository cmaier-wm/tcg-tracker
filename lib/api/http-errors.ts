export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function notFound(message: string) {
  return new HttpError(404, message);
}

export function badRequest(message: string) {
  return new HttpError(400, message);
}

export function unauthorized(message: string) {
  return new HttpError(401, message);
}
