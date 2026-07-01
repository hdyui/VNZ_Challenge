// src/features/accounts/pages/AccountCreatePage.tsx
import { AccountForm } from "../components/AccountForm";
import { useCreateAccount } from "../hooks/useAccount";
import type { CreateAccountFormValues } from "../schema";

export const AccountCreatePage = () => {
  // Lấy hook tạo tài khoản ra xài
  const { mutate: createAccount, isPending } = useCreateAccount();

  // Hàm xử lý khi user bấm nút Submit
  const handleCreate = (data: CreateAccountFormValues) => {
    // Quăng nguyên cục data từ form vào hook mutate,
    // Data này sẽ được truyền thẳng tới services.ts để nhét vào FormData
    createAccount(data);
  };

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <AccountForm onSubmit={handleCreate} isLoading={isPending} />
    </div>
  );
};
