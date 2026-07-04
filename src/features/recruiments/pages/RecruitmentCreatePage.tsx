// src/features/recruitment/pages/RecruitmentCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { RecruitmentForm } from "../components/RecruitmentForm";
import { useCreateRecruitment } from "../hooks/useRecruitment";
import {
  toRecruitmentPayload,
  type RecruitmentFormSchemaType,
} from "../schema";

const RecruitmentCreatePage = () => {
  const navigate = useNavigate();
  const { mutate: createRecruitment, isPending } = useCreateRecruitment();

  const handleCreate = (data: RecruitmentFormSchemaType) => {
    createRecruitment(toRecruitmentPayload(data), {
      onSuccess: () => navigate("/admin/recruitments"),
    });
  };

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <RecruitmentForm onSubmit={handleCreate} isLoading={isPending} />
    </div>
  );
};

export default RecruitmentCreatePage;
