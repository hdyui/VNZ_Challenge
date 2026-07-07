import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { useDeleteAccountMutation } from "../hooks/useUser";

interface Props {
  userId?: string;
}

const DeleteAccountDialog = ({ userId }: Props) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteAccount, isPending } = useDeleteAccountMutation();

  const handleDelete = () => {
    if (!userId) return;
    deleteAccount(userId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Xoá tài khoản
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-3 text-sm text-gray-600">
          <p>
            Hành động này sẽ xoá vĩnh viễn tài khoản của bạn và{" "}
            <strong>không thể hoàn tác</strong>. Bạn sẽ bị đăng xuất ngay sau
            đó.
          </p>
          <p>Bạn có chắc chắn muốn tiếp tục không?</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !userId}
          >
            {isPending ? "Đang xoá..." : "Xoá vĩnh viễn"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
