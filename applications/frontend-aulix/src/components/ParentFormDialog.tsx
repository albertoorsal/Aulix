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
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { addParent, updateParent } from "@/features/parents/parentSlice";
import { parentErrorMessage } from "@/features/parents/parentErrors";
import {
  emptyParentForm,
  toCreateRequest,
  toParentFormValues,
  toUpdateRequest,
  validateParentForm,
  violationsToFormErrors,
  type ParentFormMode,
  type ParentFormValues,
} from "@/features/parents/parentForm";
import {
  PARENT_EMAIL_MAX,
  PARENT_NAME_MAX,
  PARENT_PASSWORD_MAX,
  PARENT_PHONE_MAX,
  parentName,
  type ParentResponse,
} from "@/schemas/parent";

interface ParentFormDialogProps {
  mode: ParentFormMode;
  parent?: ParentResponse; // required when mode === "edit"
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (parent: ParentResponse) => void;
}

export default function ParentFormDialog({
  mode,
  parent,
  open,
  onOpenChange,
  onSaved,
}: ParentFormDialogProps) {
  const dispatch = useAppDispatch();
  const isEdit = mode === "edit";

  const formik = useFormik<ParentFormValues>({
    initialValues: isEdit && parent ? toParentFormValues(parent) : emptyParentForm,
    enableReinitialize: true,
    validate: (values) => validateParentForm(values, mode),
    onSubmit: async (values, { resetForm, setErrors }) => {
      const result =
        isEdit && parent
          ? await dispatch(updateParent({ id: parent.id, body: toUpdateRequest(values) }))
          : await dispatch(addParent(toCreateRequest(values)));

      if (addParent.fulfilled.match(result) || updateParent.fulfilled.match(result)) {
        toast.success(isEdit ? "Parent updated" : "Parent created");
        resetForm();
        onOpenChange(false);
        onSaved?.(result.payload);
        return;
      }

      const error = result.payload;
      if (error?.code === "RESOURCE_ALREADY_EXISTS") {
        setErrors({ email: "This email is already in use" });
      } else if (error?.code === "VALIDATION_FAILED") {
        setErrors(violationsToFormErrors(error.violations));
      }
      toast.error(parentErrorMessage(error, isEdit ? "update" : "create"));
    },
  });

  function fieldError(name: keyof ParentFormValues) {
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
            <DialogTitle>{isEdit ? "Edit parent" : "Add parent"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? `Update the details of ${parent ? parentName(parent) : "this parent"}. The email is also the sign-in name.`
                : "This also creates the parent's sign-in account. Share the email and password with them."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Field data-invalid={!!fieldError("firstName")}>
                <FieldLabel htmlFor="firstName">First name</FieldLabel>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={PARENT_NAME_MAX}
                  aria-invalid={!!fieldError("firstName")}
                />
                <FieldError errors={fieldError("firstName")} />
              </Field>

              <Field data-invalid={!!fieldError("lastName")}>
                <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={PARENT_NAME_MAX}
                  aria-invalid={!!fieldError("lastName")}
                />
                <FieldError errors={fieldError("lastName")} />
              </Field>

              <Field className="md:col-span-2" data-invalid={!!fieldError("email")}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={PARENT_EMAIL_MAX}
                  aria-invalid={!!fieldError("email")}
                />
                <FieldError errors={fieldError("email")} />
              </Field>

              <Field data-invalid={!!fieldError("phone")}>
                <FieldLabel htmlFor="phone">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={PARENT_PHONE_MAX}
                  placeholder="+52 55 1234 5678"
                  aria-invalid={!!fieldError("phone")}
                />
                <FieldError errors={fieldError("phone")} />
              </Field>

              {!isEdit && (
                <Field data-invalid={!!fieldError("password")}>
                  <FieldLabel htmlFor="password">Initial password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={PARENT_PASSWORD_MAX}
                    aria-invalid={!!fieldError("password")}
                  />
                  {fieldError("password") ? (
                    <FieldError errors={fieldError("password")} />
                  ) : (
                    <FieldDescription>At least 8 characters.</FieldDescription>
                  )}
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
