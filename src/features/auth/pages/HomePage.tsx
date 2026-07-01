// src/pages/HomePage.tsx
import { Link } from "react-router-dom";

const STATS = [
  { value: "128", label: "Nhân viên" },
  { value: "14", label: "Vị trí đang tuyển" },
  { value: "36", label: "Tin tức tháng này" },
];

const NEWS = [
  {
    date: "26/06/2026",
    title:
      "Công ty ra mắt hệ thống quản lý nhân sự mới, triển khai toàn bộ phòng ban",
    badge: "Nội bộ",
    badgeColor: "bg-blue-50 text-blue-600",
    readTime: "3 phút đọc",
  },
  {
    date: "24/06/2026",
    title: "Kết quả kinh doanh Q2/2026: doanh thu tăng 18% so với cùng kỳ",
    badge: "Báo cáo",
    badgeColor: "bg-blue-50 text-blue-600",
    readTime: "5 phút đọc",
  },
  {
    date: "20/06/2026",
    title: "Chương trình đào tạo kỹ năng mềm Q3 — đăng ký trước 30/06",
    badge: "Sắp hết hạn",
    badgeColor: "bg-red-50 text-red-600",
    readTime: "2 phút đọc",
  },
];

const JOBS = [
  {
    title: "Frontend Developer (React)",
    location: "Hồ Chí Minh",
    type: "Full-time",
    salary: "20–30 triệu",
  },
  {
    title: "HR Executive",
    location: "Hồ Chí Minh",
    type: "Full-time",
    salary: "15–22 triệu",
  },
  {
    title: "Business Analyst",
    location: "Hà Nội",
    type: "Hybrid",
    salary: "18–28 triệu",
  },
  {
    title: "Marketing Specialist",
    location: "Hồ Chí Minh",
    type: "Full-time",
    salary: "12–18 triệu",
  },
];

export const HomePage = () => {
  return (
    <div className="space-y-0 divide-y divide-slate-200">
      {/* ── Hero ── */}
      <section className="pb-8">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
          VNZ Company
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 leading-snug max-w-lg">
          Quản lý nhân sự, tin tức &amp; tuyển dụng trong một nơi
        </h1>
        <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-md">
          Theo dõi nhân viên, đăng tin nội bộ và quản lý quy trình tuyển dụng —
          nhanh, gọn, rõ ràng.
        </p>
        <div className="flex gap-3 mt-6 flex-wrap">
          <Link
            to="/recruitments"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 h-9 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Xem tuyển dụng
          </Link>
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-sm px-4 h-9 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Tin tức mới nhất
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-slate-100 rounded-lg px-4 py-3">
              <div className="text-xl font-semibold text-slate-900">
                {s.value}
              </div>
              <div className="text-[13px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── News ── */}
      <section className="py-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium text-slate-900">
            Tin tức nổi bật
          </h2>
          <Link
            to="/news"
            className="text-[13px] text-blue-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {NEWS.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <p className="text-[11px] text-slate-400 mb-1.5">{item.date}</p>
              <h3 className="text-[14px] font-medium text-slate-800 leading-snug line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <span className="text-[11px] text-slate-400">
                  {item.readTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Jobs ── */}
      <section className="pt-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium text-slate-900">
            Vị trí đang tuyển dụng
          </h2>
          <Link
            to="/recruitments"
            className="text-[13px] text-blue-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {JOBS.map((job) => (
            <div
              key={job.title}
              className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-[14px] font-medium text-slate-800">
                  {job.title}
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  {job.location} · {job.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-green-600">
                  {job.salary}
                </span>
                <Link
                  to="/recruitments"
                  className="text-[12px] px-3 py-1 rounded-md border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  Ứng tuyển
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
