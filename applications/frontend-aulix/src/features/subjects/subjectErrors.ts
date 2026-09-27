import type { ApiErrorPayload } from "@/lib/api-error";
import type { MemberKind } from "@/schemas/subject";

// subject-service's raw messages embed UUIDs ("Teacher '3f2…' is already assigned to subject
// '9a1…'"); these turn the error code/status into something a user can act on.

export function subjectErrorMessage(error: ApiErrorPayload | undefined, action: string): string {
  if (!error) return `Could not ${action} subject`;
  switch (error.code) {
    case "RESOURCE_ALREADY_EXISTS":
      return "A subject with this code already exists.";
    case "RESOURCE_NOT_FOUND":
      return "This subject no longer exists. It may have been deleted by someone else.";
    case "CONFLICT":
      // DB foreign key: subject_teacher / subject_student rows still point at the subject.
      return action === "delete"
        ? "This subject still has teachers or students. Remove them before deleting it."
        : "This change conflicts with existing data.";
    case "VALIDATION_FAILED":
      return error.violations?.length
        ? error.violations.map((v) => `${v.field}: ${v.message}`).join(", ")
        : "Some fields are invalid.";
    case "FORBIDDEN":
      return `You don't have permission to ${action} subjects.`;
  }
  return error.message;
}

export function memberErrorMessage(
  error: ApiErrorPayload | undefined,
  kind: MemberKind,
  name: string,
  action: "add" | "remove",
): string {
  const role = kind === "teacher" ? "teacher" : "student";
  if (!error) return `Could not ${action} ${name}`;
  switch (error.code) {
    case "RESOURCE_ALREADY_EXISTS":
      return kind === "teacher"
        ? `${name} is already assigned to this subject.`
        : `${name} is already enrolled in this subject.`;
    case "RESOURCE_NOT_FOUND":
      return action === "add"
        ? `${name} could not be found. The ${role} record may have been deleted, or the subject itself no longer exists.`
        : `${name} is no longer linked to this subject.`;
    case "FORBIDDEN":
      return `You don't have permission to change this subject's ${role}s.`;
  }
  // RemoteServiceException: subject-service couldn't reach teacher-/student-service to validate.
  if (error.status === 502) {
    return `Couldn't verify ${name} because the ${role} service isn't responding. Try again shortly.`;
  }
  return error.message;
}
