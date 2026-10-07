import type { FieldViolation } from "@/lib/api-error";
import {
  PARENT_EMAIL_MAX,
  PARENT_NAME_MAX,
  PARENT_PASSWORD_MAX,
  PARENT_PASSWORD_MIN,
  PARENT_PHONE_MAX,
  type CreateParentRequest,
  type ParentResponse,
  type UpdateParentRequest,
} from "@/schemas/parent";

export type ParentFormMode = "create" | "edit";

export interface ParentFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Only used when creating: the parent's initial sign-in password.
  password: string;
}

export type ParentFormErrors = Partial<Record<keyof ParentFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]*$/;

export const emptyParentForm: ParentFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export function toParentFormValues(parent: ParentResponse): ParentFormValues {
  return {
    firstName: parent.firstName ?? "",
    lastName: parent.lastName ?? "",
    email: parent.email ?? "",
    phone: parent.phone ?? "",
    password: "",
  };
}

export function validateParentForm(
  values: ParentFormValues,
  mode: ParentFormMode,
): ParentFormErrors {
  const errors: ParentFormErrors = {};

  for (const field of ["firstName", "lastName"] as const) {
    const value = values[field].trim();
    if (!value) errors[field] = "Required";
    else if (value.length > PARENT_NAME_MAX)
      errors[field] = `Must be at most ${PARENT_NAME_MAX} characters`;
  }

  const email = values.email.trim();
  if (!email) errors.email = "Required";
  else if (email.length > PARENT_EMAIL_MAX)
    errors.email = `Must be at most ${PARENT_EMAIL_MAX} characters`;
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address";

  const phone = values.phone.trim();
  if (phone.length > PARENT_PHONE_MAX)
    errors.phone = `Must be at most ${PARENT_PHONE_MAX} characters`;
  else if (!PHONE_PATTERN.test(phone)) errors.phone = "Use only digits, spaces and + ( ) - .";

  if (mode === "create") {
    if (!values.password) errors.password = "Required";
    else if (
      values.password.length < PARENT_PASSWORD_MIN ||
      values.password.length > PARENT_PASSWORD_MAX
    )
      errors.password = `Must be between ${PARENT_PASSWORD_MIN} and ${PARENT_PASSWORD_MAX} characters`;
  }

  return errors;
}

function phoneOrNull(phone: string): string | null {
  const trimmed = phone.trim();
  return trimmed === "" ? null : trimmed;
}

export function toCreateRequest(values: ParentFormValues): CreateParentRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: phoneOrNull(values.phone),
    password: values.password,
  };
}

export function toUpdateRequest(values: ParentFormValues): UpdateParentRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: phoneOrNull(values.phone),
  };
}

// Maps backend bean-validation violations (field names match the request DTOs) onto the form.
export function violationsToFormErrors(violations: FieldViolation[] | undefined): ParentFormErrors {
  const errors: ParentFormErrors = {};
  for (const v of violations ?? []) {
    if (v.field in emptyParentForm) {
      errors[v.field as keyof ParentFormValues] = v.message;
    }
  }
  return errors;
}
