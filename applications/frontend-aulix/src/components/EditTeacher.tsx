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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { useFormik } from "formik";
import DatePicker from "@/components/DatePicker";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { updateTeacher } from "../features/teachers/teacherSlice";
import {
  TEACHER_TYPES,
  type TeacherResponse,
  type TeacherType,
  type UpdateTeacherRequest,
} from "@/schemas/teacher";

interface EditTeacherFormValues {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | undefined;
  teacherType: TeacherType | "";
  department: string;
  subjectSpecialization: string;
  salary: number | null;
}

function toFormValues(teacher: TeacherResponse): EditTeacherFormValues {
  return {
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    dateOfBirth: teacher.dateOfBirth
      ? parseISO(teacher.dateOfBirth)
      : undefined,
    teacherType: teacher.teacherType,
    department: teacher.department,
    subjectSpecialization: teacher.subjectSpecialization,
    salary: teacher.salary,
  };
}

function validate(values: EditTeacherFormValues) {
  const errors: Partial<Record<keyof EditTeacherFormValues, string>> = {};
  if (!values.firstName) errors.firstName = "Required";
  if (!values.lastName) errors.lastName = "Required";
  if (!values.email) errors.email = "Required";
  if (!values.dateOfBirth) errors.dateOfBirth = "Required";
  if (!values.teacherType) errors.teacherType = "Required";
  if (!values.department) errors.department = "Required";
  if (!values.subjectSpecialization)
    errors.subjectSpecialization = "Required";
  if (values.salary === null) errors.salary = "Required";
  return errors;
}

interface EditTeacherProps {
  teacher: TeacherResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTeacher({
  teacher,
  open,
  onOpenChange,
}: EditTeacherProps) {
  const dispatch = useAppDispatch();

  const formik = useFormik<EditTeacherFormValues>({
    initialValues: toFormValues(teacher),
    validate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const body: UpdateTeacherRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: format(values.dateOfBirth as Date, "yyyy-MM-dd"),
        teacherType: values.teacherType as TeacherType,
        department: values.department,
        subjectSpecialization: values.subjectSpecialization,
        salary: values.salary as number,
      };

      const result = await dispatch(updateTeacher({ id: teacher.id, body }));

      if (updateTeacher.fulfilled.match(result)) {
        toast.success("Teacher updated successfully");
        onOpenChange(false);
      } else {
        toast.error((result.payload as string) || "Failed to update teacher");
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: toFormValues(teacher) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teacher]);

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
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher information</DialogDescription>
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
                <FieldLabel htmlFor="edit-date-picker">Date of birth</FieldLabel>
                <DatePicker
                  id="edit-date-picker"
                  value={formik.values.dateOfBirth}
                  onChange={(date) => formik.setFieldValue("dateOfBirth", date)}
                  placeholder="Date of birth"
                  kind="birth"
                  defaultYear={new Date().getFullYear() - 35}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-teacherType">
                  Teacher Type
                </FieldLabel>
                <Select
                  value={formik.values.teacherType}
                  onValueChange={(value) =>
                    formik.setFieldValue("teacherType", value)
                  }
                >
                  <SelectTrigger id="edit-teacherType">
                    <SelectValue placeholder="Select teacher type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEACHER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-subjectSpecialization">
                  Subject Specialization
                </Label>
                <Input
                  id="edit-subjectSpecialization"
                  name="subjectSpecialization"
                  value={formik.values.subjectSpecialization}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-salary">Salary</Label>
                <Input
                  id="edit-salary"
                  name="salary"
                  value={formik.values.salary ?? ""}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "salary",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
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
