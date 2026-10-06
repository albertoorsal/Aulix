import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { setUserEnabled } from "@/features/users/userSlice";
import { userErrorMessage } from "@/features/users/userErrors";
import type { UserResponse } from "@/schemas/user";

// Enabling is not destructive, so unlike disabling it runs without a confirmation dialog.
export function useEnableUser(): (user: UserResponse) => Promise<void> {
  const dispatch = useAppDispatch();

  return async (user) => {
    const result = await dispatch(setUserEnabled({ id: user.id, enabled: true }));
    if (setUserEnabled.fulfilled.match(result)) {
      toast.success(`${user.firstName} ${user.lastName} enabled`);
    } else {
      toast.error(userErrorMessage(result.payload, "enable"));
    }
  };
}
