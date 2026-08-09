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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { updateStudent } from "../features/students/studentSlice";
import type { StudentResponse, UpdateStudentRequest } from "@/schemas/student";

interface EditStudentFormValues {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | undefined;
  gradeLevel: number | null;
}

function toFormValues(student: StudentResponse): EditStudentFormValues {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    dateOfBirth: student.dateOfBirth ? parseISO(student.dateOfBirth) : undefined,
    gradeLevel: student.gradeLevel,
  };
}

function validate(values: EditStudentFormValues) {
  const errors: Partial<Record<keyof EditStudentFormValues, string>> = {};
  if (!values.firstName) errors.firstName = "Required";
  if (!values.lastName) errors.lastName = "Required";
  if (!values.email) errors.email = "Required";
  if (!values.dateOfBirth) errors.dateOfBirth = "Required";
  if (values.gradeLevel === null) errors.gradeLevel = "Required";
  return errors;
}

interface EditStudentProps {
  student: StudentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditStudent({
  student,
  open,
  onOpenChange,
}: EditStudentProps) {
  const dispatch = useAppDispatch();

  const formik = useFormik<EditStudentFormValues>({
    initialValues: toFormValues(student),
    validate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const body: UpdateStudentRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: format(values.dateOfBirth as Date, "yyyy-MM-dd"),
        gradeLevel: values.gradeLevel as number,
      };

      const result = await dispatch(updateStudent({ id: student.id, body }));

      if (updateStudent.fulfilled.match(result)) {
        toast.success("Student updated successfully");
        onOpenChange(false);
      } else {
        toast.error((result.payload as string) || "Failed to update student");
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: toFormValues(student) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = validate(formik.values);
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(firstError);
    }
    formik.handleSubmit(e);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Field>
                <Label htmlFor="edit-firstName">Name(s)</Label>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-gradeLevel">Grade Level</Label>
                <Input
                  id="edit-gradeLevel"
                  name="gradeLevel"
                  value={formik.values.gradeLevel ?? ""}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "gradeLevel",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-date-picker">Date of birth</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="edit-date-picker"
                      className="w-full justify-start font-normal"
                    >
                      {formik.values.dateOfBirth ? (
                        format(formik.values.dateOfBirth, "dd/MM/yyyy")
                      ) : (
                        <span>Date of birth</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formik.values.dateOfBirth}
                      onSelect={(date) =>
                        formik.setFieldValue("dateOfBirth", date)
                      }
                      defaultMonth={formik.values.dateOfBirth}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
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
