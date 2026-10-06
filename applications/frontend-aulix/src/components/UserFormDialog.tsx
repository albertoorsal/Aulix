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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/features/users/userSlice";
import { userErrorMessage } from "@/features/users/userErrors";
import {
  toUpdateRequest,
  toUserFormValues,
  validateUserForm,
  violationsToFormErrors,
  type UserFormValues,
} from "@/features/users/userForm";
import { USER_EMAIL_MAX, USER_NAME_MAX, type UserResponse } from "@/schemas/user";

interface UserFormDialogProps {
  user: UserResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export default function UserFormDialog({ user, open, onOpenChange, onSaved }: UserFormDialogProps) {
  const dispatch = useAppDispatch();

  const formik = useFormik<UserFormValues>({
    initialValues: toUserFormValues(user),
    enableReinitialize: true,
    validate: validateUserForm,
    onSubmit: async (values, { setErrors }) => {
      const result = await dispatch(updateUser({ id: user.id, body: toUpdateRequest(values) }));

      if (updateUser.fulfilled.match(result)) {
        toast.success("User updated");
        onOpenChange(false);
        onSaved?.();
        return;
      }

      const error = result.payload;
      if (error?.code === "RESOURCE_ALREADY_EXISTS") {
        setErrors({ email: "This email is already in use" });
      } else if (error?.code === "VALIDATION_FAILED") {
        setErrors(violationsToFormErrors(error.violations));
      }
      toast.error(userErrorMessage(error, "update"));
    },
  });

  function fieldError(name: keyof UserFormValues) {
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
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update the account details of {user.firstName} {user.lastName}. The email is also
              the sign-in name.
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
                  maxLength={USER_NAME_MAX}
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
                  maxLength={USER_NAME_MAX}
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
                  maxLength={USER_EMAIL_MAX}
                  aria-invalid={!!fieldError("email")}
                />
                <FieldError errors={fieldError("email")} />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={formik.isSubmitting}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
