import type { FieldViolation } from "@/lib/api-error";
import {
  SUBJECT_CODE_MAX,
  SUBJECT_DESCRIPTION_MAX,
  SUBJECT_NAME_MAX,
  type CreateSubjectRequest,
  type SubjectResponse,
  type SubjectStatus,
  type UpdateSubjectRequest,
} from "@/schemas/subject";

export type SubjectFormMode = "create" | "edit";

export interface SubjectFormValues {
  code: string;
  name: string;
  description: string;
  // Formik parses type="number" inputs to a number, or "" when the field is empty.
  creditHours: number | "";
  status: SubjectStatus;
}

export type SubjectFormErrors = Partial<Record<keyof SubjectFormValues, string>>;

export const emptySubjectForm: SubjectFormValues = {
  code: "",
  name: "",
  description: "",
  creditHours: "",
  status: "ACTIVE",
};

export function toSubjectFormValues(subject: SubjectResponse): SubjectFormValues {
  return {
    code: subject.code,
    name: subject.name,
    description: subject.description ?? "",
    creditHours: subject.creditHours,
    status: subject.status,
  };
}

export function validateSubjectForm(
  values: SubjectFormValues,
  mode: SubjectFormMode,
): SubjectFormErrors {
  const errors: SubjectFormErrors = {};

  if (mode === "create") {
    const code = values.code.trim();
    if (!code) errors.code = "Required";
    else if (code.length > SUBJECT_CODE_MAX)
      errors.code = `Code must be at most ${SUBJECT_CODE_MAX} characters`;
    else if (!/^[A-Za-z0-9-]+$/.test(code))
      errors.code = "Use only letters, numbers and dashes";
  }

  const name = values.name.trim();
  if (!name) errors.name = "Required";
  else if (name.length > SUBJECT_NAME_MAX)
    errors.name = `Name must be at most ${SUBJECT_NAME_MAX} characters`;

  if (values.description.length > SUBJECT_DESCRIPTION_MAX)
    errors.description = `Description must be at most ${SUBJECT_DESCRIPTION_MAX} characters`;

  if (values.creditHours === "") errors.creditHours = "Required";
  else if (!Number.isInteger(values.creditHours) || values.creditHours < 1)
    errors.creditHours = "Must be a whole number of at least 1";

  return errors;
}

function descriptionOrNull(description: string): string | null {
  const trimmed = description.trim();
  return trimmed === "" ? null : trimmed;
}

export function toCreateRequest(values: SubjectFormValues): CreateSubjectRequest {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: descriptionOrNull(values.description),
    creditHours: Number(values.creditHours),
  };
}

export function toUpdateRequest(values: SubjectFormValues): UpdateSubjectRequest {
  return {
    name: values.name.trim(),
    description: descriptionOrNull(values.description),
    creditHours: Number(values.creditHours),
    status: values.status,
  };
}

// Maps backend bean-validation violations (field names match the request DTOs) onto the form.
export function violationsToFormErrors(violations: FieldViolation[] | undefined): SubjectFormErrors {
  const errors: SubjectFormErrors = {};
  for (const v of violations ?? []) {
    if (v.field in emptySubjectForm) {
      errors[v.field as keyof SubjectFormValues] = v.message;
    }
  }
  return errors;
}
