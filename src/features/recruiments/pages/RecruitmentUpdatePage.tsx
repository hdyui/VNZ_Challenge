// src/features/recruitment/pages/RecruitmentUpdatePage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  useDeleteRecruitment,
  usePublicRecruitmentDetail,
  useUpdateRecruitment,
} from "../hooks/useRecruitment";
import { RecruitmentForm } from "../components/RecruitmentForm";
import {
  toRecruitmentFormValues,
  toRecruitmentPayload,
  type RecruitmentFormSchemaType,
} from "../schema";

const RecruitmentUpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = usePublicRecruitmentDetail(id ?? "");
  const detail = data?.value;

  const { mutate: updateRecruitment, isPending } = useUpdateRecruitment();
  const { mutate: deleteRecruitment, isPending: isDeleting } =
    useDeleteRecruitment();

  const handleUpdate = (formData: RecruitmentFormSchemaType) => {
    if (!id) return;
    updateRecruitment(
      { id, ...toRecruitmentPayload(formData) },
      { onSuccess: () => navigate(`/admin/recruitments/${id}`) },
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteRecruitment(id, {
      onSuccess: () => navigate("/admin/recruitments"),
    });
  };

  if (isLoading || !detail) {
    return (
      <div className="py-4 space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <RecruitmentForm
        isEdit
        initialData={toRecruitmentFormValues(detail)}
        onSubmit={handleUpdate}
        isLoading={isPending}
        headerExtra={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa vị trí này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa vĩnh viễn{" "}
                  <strong>&ldquo;{detail.title}&rdquo;</strong>. Thao tác này
                  không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-200">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20"
                >
                  Đồng ý xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />
    </div>
  );
};

export default RecruitmentUpdatePage;
