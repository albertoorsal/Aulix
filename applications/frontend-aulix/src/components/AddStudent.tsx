import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { addStudent, searchStudents } from "../features/students/studentSlice";
import type { CreateStudentRequest } from "@/schemas/student";

interface AddStudentFormValues {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | undefined;
  enrollmentDate: Date | undefined;
  gradeLevel: number | null;
  curp: string;
  password: string;
}

const initialValues: AddStudentFormValues = {
  studentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: undefined,
  enrollmentDate: undefined,
  gradeLevel: null,
  curp: "",
  password: "",
};

function validate(values: AddStudentFormValues) {
  const errors: Partial<Record<keyof AddStudentFormValues, string>> = {};
  if (!values.studentNumber) errors.studentNumber = "Required";
  if (!values.firstName) errors.firstName = "Required";
  if (!values.lastName) errors.lastName = "Required";
  if (!values.email) errors.email = "Required";
  if (!values.dateOfBirth) errors.dateOfBirth = "Required";
  if (!values.enrollmentDate) errors.enrollmentDate = "Required";
  if (values.gradeLevel === null) errors.gradeLevel = "Required";
  if (!values.curp) errors.curp = "Required";
  else if (values.curp.length !== 13)
    errors.curp = "CURP must be 13 characters";
  if (!values.password) errors.password = "Required";
  return errors;
}

export default function AddStudent() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const formik = useFormik<AddStudentFormValues>({
    initialValues,
    validate,
    onSubmit: async (values, { resetForm }) => {
      const body: CreateStudentRequest = {
        studentNumber: values.studentNumber,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: format(values.dateOfBirth as Date, "yyyy-MM-dd"),
        enrollmentDate: format(values.enrollmentDate as Date, "yyyy-MM-dd"),
        gradeLevel: values.gradeLevel as number,
        curp: values.curp,
        password: values.password,
      };

      const result = await dispatch(addStudent(body));

      if (addStudent.fulfilled.match(result)) {
        toast.success("Student saved successfully");
        setOpen(false);
        resetForm();
        dispatch(searchStudents({ page: 0 }));
      } else {
        toast.error((result.payload as string) || "Failed to save student");
      }
    },
  });

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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) formik.resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Add +</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new Student</DialogTitle>
            <DialogDescription>Enter student information</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Field>
                <Label htmlFor="studentNumber">Number#</Label>
                <Input
                  id="studentNumber"
                  name="studentNumber"
                  value={formik.values.studentNumber}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="date-picker-enrollment">
                  Enrollment Date
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-enrollment"
                      className="w-full justify-start font-normal"
                    >
                      {formik.values.enrollmentDate ? (
                        format(formik.values.enrollmentDate, "dd/MM/yyyy")
                      ) : (
                        <span>Enrollment Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formik.values.enrollmentDate}
                      onSelect={(date) =>
                        formik.setFieldValue("enrollmentDate", date)
                      }
                      defaultMonth={formik.values.enrollmentDate}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <Label htmlFor="firstName">Names(s)</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Input
                  id="gradeLevel"
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
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="curp">CURP</Label>
                <Input
                  id="curp"
                  name="curp"
                  value={formik.values.curp}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="date-picker-simple">
                  Date of birth
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-simple"
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
