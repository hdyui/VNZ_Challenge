// src/features/accounts/pages/AccountCreatePage.tsx
import { AccountForm } from "../components/AccountForm";
import { useCreateAccount } from "../hooks/useAccount";
import type { CreateAccountFormValues } from "../schema";

export const AccountCreatePage = () => {
  const { mutate: createAccount, isPending } = useCreateAccount();

  const handleCreate = (data: CreateAccountFormValues) => {
    createAccount(data);
  };

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <AccountForm onSubmit={handleCreate} isLoading={isPending} />
    </div>
  );
};
