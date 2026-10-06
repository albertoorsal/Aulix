import type { ApiErrorPayload } from "@/lib/api-error";

// Turns auth-service error codes into messages an administrator can act on.
export function userErrorMessage(error: ApiErrorPayload | undefined, action: string): string {
  if (!error) return `Could not ${action} user`;
  switch (error.code) {
    case "RESOURCE_ALREADY_EXISTS":
      return "Another user already uses this email.";
    case "RESOURCE_NOT_FOUND":
      return "This user no longer exists. It may have been deleted by someone else.";
    case "BUSINESS_RULE_VIOLATION":
      // e.g. "You can't disable your own account": already written for the user.
      return error.message;
    case "VALIDATION_FAILED":
      return error.violations?.length
        ? error.violations.map((v) => `${v.field}: ${v.message}`).join(", ")
        : "Some fields are invalid.";
    case "FORBIDDEN":
      return `You don't have permission to ${action} users.`;
  }
  return error.message;
}
