import type { FieldViolation } from "@/lib/api-error";
import {
  USER_EMAIL_MAX,
  USER_NAME_MAX,
  type UpdateUserRequest,
  type UserResponse,
} from "@/schemas/user";

export type UserFormValues = UpdateUserRequest;

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toUserFormValues(user: UserResponse): UserFormValues {
  return { firstName: user.firstName, lastName: user.lastName, email: user.email };
}

export function validateUserForm(values: UserFormValues): UserFormErrors {
  const errors: UserFormErrors = {};

  for (const field of ["firstName", "lastName"] as const) {
    const value = values[field].trim();
    if (!value) errors[field] = "Required";
    else if (value.length > USER_NAME_MAX)
      errors[field] = `Must be at most ${USER_NAME_MAX} characters`;
  }

  const email = values.email.trim();
  if (!email) errors.email = "Required";
  else if (email.length > USER_EMAIL_MAX)
    errors.email = `Must be at most ${USER_EMAIL_MAX} characters`;
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address";

  return errors;
}

export function toUpdateRequest(values: UserFormValues): UpdateUserRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
  };
}

// Maps backend bean-validation violations (field names match UpdateUserRequest) onto the form.
export function violationsToFormErrors(violations: FieldViolation[] | undefined): UserFormErrors {
  const errors: UserFormErrors = {};
  for (const v of violations ?? []) {
    if (v.field === "firstName" || v.field === "lastName" || v.field === "email") {
      errors[v.field] = v.message;
    }
  }
  return errors;
}
