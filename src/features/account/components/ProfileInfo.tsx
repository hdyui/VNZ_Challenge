import { Mail, Phone, MapPin, Building2, Heart } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  userInfo: any;
  email?: string;
}

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
    <div className="text-primary mt-0.5 shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
        {label}
      </p>
      <p className="text-sm text-gray-800 break-words">
        {value || "Chưa cập nhật"}
      </p>
    </div>
  </div>
);

const ProfileInfo = ({ userInfo, email }: Props) => {
  const departments: any[] = Array.isArray(userInfo?.departments)
    ? userInfo.departments
    : [];

  return (
    <div className="px-8 sm:px-12 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem
          icon={<Mail className="w-5 h-5" />}
          label="Email"
          value={email}
        />
        <InfoItem
          icon={<Phone className="w-5 h-5" />}
          label="Số điện thoại"
          value={userInfo?.phone}
        />
        <InfoItem
          icon={<MapPin className="w-5 h-5" />}
          label="Địa chỉ"
          value={userInfo?.address}
        />
        <InfoItem
          icon={<Heart className="w-5 h-5" />}
          label="Sở thích"
          value={userInfo?.hobby}
        />
      </div>

      {departments.length > 0 && (
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            Phòng ban
          </h3>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <span
                key={d.id}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {d.name}
                {d.departmentCode ? ` (${d.departmentCode})` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
