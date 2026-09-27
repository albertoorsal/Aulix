// Mirrors common-core's ApiError / ApiResponse error envelope, plus the gateway's
// circuit-breaker fallback ({ success: false, message }) which carries no code.
export interface FieldViolation {
  field: string;
  message: string;
}

export type ApiErrorCode =
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_ALREADY_EXISTS"
  | "VALIDATION_FAILED"
  | "BUSINESS_RULE_VIOLATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

// Serializable shape used as a thunk rejectValue (Redux actions must stay plain objects).
export interface ApiErrorPayload {
  message: string;
  status?: number;
  code?: ApiErrorCode;
  violations?: FieldViolation[];
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: ApiErrorCode;
  readonly violations?: FieldViolation[];

  constructor(payload: ApiErrorPayload & { status: number }) {
    super(payload.message);
    this.name = "ApiRequestError";
    this.status = payload.status;
    this.code = payload.code;
    this.violations = payload.violations;
  }

  toPayload(): ApiErrorPayload {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
      violations: this.violations,
    };
  }
}

export async function toApiRequestError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiRequestError> {
  const body = await response.json().catch(() => ({}));
  return new ApiRequestError({
    status: response.status,
    message: body?.error?.message || body?.message || fallbackMessage,
    code: body?.error?.code,
    violations: body?.error?.violations,
  });
}

export function toErrorPayload(err: unknown, fallbackMessage: string): ApiErrorPayload {
  if (err instanceof ApiRequestError) return err.toPayload();
  // fetch() rejects with a TypeError when the gateway itself can't be reached.
  if (err instanceof TypeError) {
    return { message: "Can't reach the server. Check your connection and try again." };
  }
  return { message: err instanceof Error ? err.message : fallbackMessage };
}
