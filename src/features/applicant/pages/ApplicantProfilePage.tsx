import { LoadingState } from "@/shared/components/common/StatusState";
import { useApplicantProfile } from "../hooks/useApplicant";
import ProfileHeader from "@/features/account/components/ProfileHeader";
import ProfileInfo from "@/features/account/components/ProfileInfo";

const ApplicantProfilePage = () => {
  const { data, isLoading } = useApplicantProfile();

  if (isLoading) return <LoadingState />;

  const applicant = data?.value;

  const mappedUserInfo = {
    firstName: applicant?.fullName?.split(" ").pop() || "U",
    position: "Ứng viên VNZ",
    phone: applicant?.phone,
    address: applicant?.address,
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 pt-6 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Tái sử dụng ProfileHeader của Admin/Employee */}
        <ProfileHeader
          userInfo={mappedUserInfo}
          role="Applicant"
          fullName={applicant?.fullName || "Chưa cập nhật tên"}
          triggerUpload={() => {
            // Hàm ảo vì API chưa hỗ trợ Applicant up avatar
          }}
        />

        {/* Tái sử dụng ProfileInfo của Admin/Employee */}
        <ProfileInfo userInfo={mappedUserInfo} email={applicant?.email} />
      </div>
    </div>
  );
};

export default ApplicantProfilePage;
