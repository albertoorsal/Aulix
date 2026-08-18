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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { addStaff, searchStaffs } from "../features/staffs/staffSlice";
import { STAFF_TYPES, type CreateStaffRequest, type StaffType } from "@/schemas/staff";

interface AddStaffFormValues {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | undefined;
  staffType: StaffType | "";
  hireDate: Date | undefined;
  department: string;
  jobTitle: string;
  salary: number | null;
  curp: string;
  password: string;
}

const initialValues: AddStaffFormValues = {
  employeeNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: undefined,
  staffType: "",
  hireDate: undefined,
  department: "",
  jobTitle: "",
  salary: null,
  curp: "",
  password: "",
};

function validate(values: AddStaffFormValues) {
  const errors: Partial<Record<keyof AddStaffFormValues, string>> = {};
  if (!values.employeeNumber) errors.employeeNumber = "Required";
  if (!values.firstName) errors.firstName = "Required";
  if (!values.lastName) errors.lastName = "Required";
  if (!values.email) errors.email = "Required";
  if (!values.dateOfBirth) errors.dateOfBirth = "Required";
  if (!values.staffType) errors.staffType = "Required";
  if (!values.hireDate) errors.hireDate = "Required";
  if (!values.department) errors.department = "Required";
  if (!values.jobTitle) errors.jobTitle = "Required";
  if (values.salary === null) errors.salary = "Required";
  if (!values.curp) errors.curp = "Required";
  else if (values.curp.length !== 13)
    errors.curp = "CURP must be 13 characters";
  if (!values.password) errors.password = "Required";
  return errors;
}

export default function AddStaff() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const formik = useFormik<AddStaffFormValues>({
    initialValues,
    validate,
    onSubmit: async (values, { resetForm }) => {
      const body: CreateStaffRequest = {
        employeeNumber: values.employeeNumber,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: format(values.dateOfBirth as Date, "yyyy-MM-dd"),
        staffType: values.staffType as StaffType,
        hireDate: format(values.hireDate as Date, "yyyy-MM-dd"),
        department: values.department,
        jobTitle: values.jobTitle,
        salary: values.salary as number,
        curp: values.curp,
        password: values.password,
      };

      const result = await dispatch(addStaff(body));

      if (addStaff.fulfilled.match(result)) {
        toast.success("Staff saved successfully");
        setOpen(false);
        resetForm();
        dispatch(searchStaffs({ page: 0 }));
      } else {
        toast.error((result.payload as string) || "Failed to save staff");
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
            <DialogTitle>Create new Staff</DialogTitle>
            <DialogDescription>Enter staff information</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <Field>
                <Label htmlFor="employeeNumber">Number#</Label>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  value={formik.values.employeeNumber}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="date-picker-hire">Hire Date</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-hire"
                      className="w-full justify-start font-normal"
                    >
                      {formik.values.hireDate ? (
                        format(formik.values.hireDate, "dd/MM/yyyy")
                      ) : (
                        <span>Hire Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formik.values.hireDate}
                      onSelect={(date) => formik.setFieldValue("hireDate", date)}
                      defaultMonth={formik.values.hireDate}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <Label htmlFor="firstName">Name(s)</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
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
                <FieldLabel htmlFor="date-picker-dob">Date of birth</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-dob"
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
                <FieldLabel htmlFor="staffType">Staff Type</FieldLabel>
                <Select
                  value={formik.values.staffType}
                  onValueChange={(value) =>
                    formik.setFieldValue("staffType", value)
                  }
                >
                  <SelectTrigger id="staffType">
                    <SelectValue placeholder="Select staff type" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formik.values.jobTitle}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
