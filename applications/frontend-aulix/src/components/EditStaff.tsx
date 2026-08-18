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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { updateStaff } from "../features/staffs/staffSlice";
import {
  STAFF_TYPES,
  type StaffResponse,
  type StaffType,
  type UpdateStaffRequest,
} from "@/schemas/staff";

interface EditStaffFormValues {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | undefined;
  staffType: StaffType | "";
  department: string;
  jobTitle: string;
  salary: number | null;
}

function toFormValues(staff: StaffResponse): EditStaffFormValues {
  return {
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    dateOfBirth: staff.dateOfBirth ? parseISO(staff.dateOfBirth) : undefined,
    staffType: staff.staffType,
    department: staff.department,
    jobTitle: staff.jobTitle,
    salary: staff.salary,
  };
}

function validate(values: EditStaffFormValues) {
  const errors: Partial<Record<keyof EditStaffFormValues, string>> = {};
  if (!values.firstName) errors.firstName = "Required";
  if (!values.lastName) errors.lastName = "Required";
  if (!values.email) errors.email = "Required";
  if (!values.dateOfBirth) errors.dateOfBirth = "Required";
  if (!values.staffType) errors.staffType = "Required";
  if (!values.department) errors.department = "Required";
  if (!values.jobTitle) errors.jobTitle = "Required";
  if (values.salary === null) errors.salary = "Required";
  return errors;
}

interface EditStaffProps {
  staff: StaffResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditStaff({ staff, open, onOpenChange }: EditStaffProps) {
  const dispatch = useAppDispatch();

  const formik = useFormik<EditStaffFormValues>({
    initialValues: toFormValues(staff),
    validate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const body: UpdateStaffRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: format(values.dateOfBirth as Date, "yyyy-MM-dd"),
        staffType: values.staffType as StaffType,
        department: values.department,
        jobTitle: values.jobTitle,
        salary: values.salary as number,
      };

      const result = await dispatch(updateStaff({ id: staff.id, body }));

      if (updateStaff.fulfilled.match(result)) {
        toast.success("Staff updated successfully");
        onOpenChange(false);
      } else {
        toast.error((result.payload as string) || "Failed to update staff");
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: toFormValues(staff) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff]);

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
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>Update staff information</DialogDescription>
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
              <Field>
                <FieldLabel htmlFor="edit-staffType">Staff Type</FieldLabel>
                <Select
                  value={formik.values.staffType}
                  onValueChange={(value) =>
                    formik.setFieldValue("staffType", value)
                  }
                >
                  <SelectTrigger id="edit-staffType">
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
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                />
              </Field>
              <Field>
                <Label htmlFor="edit-jobTitle">Job Title</Label>
                <Input
                  id="edit-jobTitle"
                  name="jobTitle"
                  value={formik.values.jobTitle}
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
