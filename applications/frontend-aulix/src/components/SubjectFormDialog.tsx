import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { addSubject, updateSubject } from "@/features/subjects/subjectSlice";
import { subjectErrorMessage } from "@/features/subjects/subjectErrors";
import {
  emptySubjectForm,
  toCreateRequest,
  toSubjectFormValues,
  toUpdateRequest,
  validateSubjectForm,
  violationsToFormErrors,
  type SubjectFormMode,
  type SubjectFormValues,
} from "@/features/subjects/subjectForm";
import {
  SUBJECT_CODE_MAX,
  SUBJECT_DESCRIPTION_MAX,
  SUBJECT_STATUSES,
  type SubjectResponse,
  type SubjectStatus,
} from "@/schemas/subject";

interface SubjectFormDialogProps {
  mode: SubjectFormMode;
  subject?: SubjectResponse; // required when mode === "edit"
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (subject: SubjectResponse) => void;
}

export default function SubjectFormDialog({
  mode,
  subject,
  open,
  onOpenChange,
  onSaved,
}: SubjectFormDialogProps) {
  const dispatch = useAppDispatch();
  const isEdit = mode === "edit";

  const formik = useFormik<SubjectFormValues>({
    initialValues: isEdit && subject ? toSubjectFormValues(subject) : emptySubjectForm,
    enableReinitialize: true,
    validate: (values) => validateSubjectForm(values, mode),
    onSubmit: async (values, { resetForm, setErrors }) => {
      const result =
        isEdit && subject
          ? await dispatch(updateSubject({ id: subject.id, body: toUpdateRequest(values) }))
          : await dispatch(addSubject(toCreateRequest(values)));

      if (addSubject.fulfilled.match(result) || updateSubject.fulfilled.match(result)) {
        toast.success(isEdit ? "Subject updated" : "Subject created");
        resetForm();
        onOpenChange(false);
        onSaved?.(result.payload);
        return;
      }

      const error = result.payload;
      if (error?.code === "RESOURCE_ALREADY_EXISTS") {
        setErrors({ code: "This code is already in use" });
      } else if (error?.code === "VALIDATION_FAILED") {
        setErrors(violationsToFormErrors(error.violations));
      }
      toast.error(subjectErrorMessage(error, isEdit ? "update" : "create"));
    },
  });

  function fieldError(name: keyof SubjectFormValues) {
    const message = formik.touched[name] ? formik.errors[name] : undefined;
    return message ? [{ message }] : undefined;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) formik.resetForm();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={formik.handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit subject" : "Create new subject"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? `Update the details of ${subject?.code}.`
                : "Enter the subject information."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Field data-invalid={!!fieldError("code")}>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input
                  id="code"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isEdit}
                  maxLength={SUBJECT_CODE_MAX}
                  placeholder="MATH-101"
                  className="uppercase"
                  aria-invalid={!!fieldError("code")}
                />
                {isEdit ? (
                  <FieldDescription>The code can't be changed.</FieldDescription>
                ) : (
                  <FieldError errors={fieldError("code")} />
                )}
              </Field>

              <Field data-invalid={!!fieldError("creditHours")}>
                <FieldLabel htmlFor="creditHours">Credit hours</FieldLabel>
                <Input
                  id="creditHours"
                  name="creditHours"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={formik.values.creditHours}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={!!fieldError("creditHours")}
                />
                <FieldError errors={fieldError("creditHours")} />
              </Field>

              <Field className="md:col-span-2" data-invalid={!!fieldError("name")}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Mathematics I"
                  aria-invalid={!!fieldError("name")}
                />
                <FieldError errors={fieldError("name")} />
              </Field>

              <Field className="md:col-span-2" data-invalid={!!fieldError("description")}>
                <FieldLabel htmlFor="description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={!!fieldError("description")}
                />
                <FieldDescription>
                  {formik.values.description.length}/{SUBJECT_DESCRIPTION_MAX}
                </FieldDescription>
                <FieldError errors={fieldError("description")} />
              </Field>

              {isEdit && (
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    value={formik.values.status}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value as SubjectStatus)
                    }
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={formik.isSubmitting}>
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
