import type { ApiErrorPayload } from "@/lib/api-error";

// parent-service's raw messages embed UUIDs; these turn the error code/status into something a
// user can act on.

export function parentErrorMessage(error: ApiErrorPayload | undefined, action: string): string {
  if (!error) return `Could not ${action} parent`;
  switch (error.code) {
    case "RESOURCE_ALREADY_EXISTS":
      return "Another account already uses this email.";
    case "RESOURCE_NOT_FOUND":
      return "This parent no longer exists. It may have been deleted by someone else.";
    case "VALIDATION_FAILED":
      return error.violations?.length
        ? error.violations.map((v) => `${v.field}: ${v.message}`).join(", ")
        : "Some fields are invalid.";
    case "FORBIDDEN":
      return `You don't have permission to ${action} parents.`;
  }
  // UserProvisioningException: parent-service couldn't reach auth-service.
  if (error.status === 502) {
    return "The account service isn't responding, so nothing was saved. Try again shortly.";
  }
  return error.message;
}

export function linkErrorMessage(
  error: ApiErrorPayload | undefined,
  name: string,
  action: "link" | "update" | "unlink",
): string {
  if (!error) return `Could not ${action} ${name}`;
  switch (error.code) {
    case "RESOURCE_ALREADY_EXISTS":
      return `${name} is already linked to this parent.`;
    case "RESOURCE_NOT_FOUND":
      return action === "link"
        ? `${name} could not be found. The student record may have been deleted, or the parent itself no longer exists.`
        : `${name} is no longer linked to this parent.`;
    case "VALIDATION_FAILED":
      return "Choose a relationship.";
    case "FORBIDDEN":
      return "You don't have permission to change this parent's students.";
  }
  // RemoteServiceException: parent-service couldn't reach student-service to validate.
  if (error.status === 502) {
    return `Couldn't verify ${name} because the student service isn't responding. Try again shortly.`;
  }
  return error.message;
}
