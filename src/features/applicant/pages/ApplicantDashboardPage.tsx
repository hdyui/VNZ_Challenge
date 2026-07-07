import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  XOctagon,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  useApplicantApplications,
  useApplicantMe,
} from "@/features/applicant/hooks/useApplicant";

// Định nghĩa màu sắc và icon cho từng trạng thái đơn
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  Submitted: {
    label: "Đã nộp",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  Reviewed: {
    label: "Đã xem",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Eye,
  },
  InterviewScheduled: {
    label: "Hẹn phỏng vấn",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Calendar,
  },
  Approved: {
    label: "Đã trúng tuyển",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Từ chối",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: XOctagon,
  },
};

function Eye(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinelinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const ApplicantDashboardPage = () => {
  const navigate = useNavigate();
  const { data: meData, isLoading: meLoading } = useApplicantMe();
  const { data: appsData, isLoading: appsLoading } = useApplicantApplications();

  const applications = appsData?.value ?? [];

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Hồ sơ ứng tuyển
            </h1>
            <p className="text-gray-500 mt-1">
              {meLoading ? (
                <Skeleton className="h-5 w-48 mt-1" />
              ) : (
                `Xin chào, ${meData?.value?.fullName}! Dưới đây là các vị trí bạn đã nộp.`
              )}
            </p>
          </div>
          <Button
            onClick={() => navigate("/recruitments")}
            variant="outline"
            className="bg-white"
          >
            <BriefcaseBusiness className="w-4 h-4 mr-2" />
            Tìm thêm việc làm
          </Button>

          <Button
            onClick={() => navigate("/applicant/profile")}
            variant="outline"
            className="bg-white"
          >
            <BriefcaseBusiness className="w-4 h-4 mr-2" />
            Trang cá nhân
          </Button>
        </div>

        {/* List Applications */}
        {appsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-white/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BriefcaseBusiness className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Bạn chưa nộp đơn nào
              </h3>
              <p className="text-gray-500 mt-1 max-w-sm">
                Hãy khám phá các cơ hội nghề nghiệp tại công ty và nộp đơn ngay
                hôm nay.
              </p>
              <Button
                onClick={() => navigate("/recruitments")}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700"
              >
                Xem danh sách việc làm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const config =
                STATUS_CONFIG[app.status] || STATUS_CONFIG["Submitted"];
              const StatusIcon = config.icon;

              return (
                <Card
                  key={app.applicationId}
                  className="group cursor-pointer hover:shadow-md transition-all border-gray-200 overflow-hidden"
                  onClick={() =>
                    navigate(`/applicant/applications/${app.applicationId}`)
                  }
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                      <div className="space-y-1.5 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {app.recruitmentTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {app.recruitmentLocation && (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              {app.recruitmentLocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            Đã nộp:{" "}
                            {format(new Date(app.createdAt), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${config.color}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {config.label}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboardPage;
