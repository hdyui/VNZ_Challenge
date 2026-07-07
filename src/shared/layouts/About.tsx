// src/features/about/pages/About.tsx
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Target,
  Building2,
  Users,
  Landmark,
  ArrowRight,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useLogoutMutation } from "@/features/auth/hooks/useAuth";

const CORE_VALUES = [
  {
    icon: BookOpen,
    title: "Học hỏi",
    desc: "Chủ động tiếp cận tri thức và mô hình thành công từ thế giới, rút ngắn khoảng cách để đi nhanh hơn mỗi ngày.",
  },
  {
    icon: Sparkles,
    title: "Đổi mới",
    desc: "Giữ tinh thần khởi nghiệp, dám thử nghiệm cái mới và thích nghi nhanh với những thay đổi của thị trường.",
  },
  {
    icon: ShieldCheck,
    title: "Chính trực",
    desc: "Trung thực và tinh thần phụng sự là nền tảng cho mọi mối quan hệ hợp tác lâu dài với khách hàng, đối tác.",
  },
  {
    icon: Target,
    title: "Giá trị thực",
    desc: "Không chạy theo công nghệ vì công nghệ — chỉ lựa chọn giải pháp phù hợp nhất để tạo ra giá trị thật.",
  },
];

const AUDIENCES = [
  {
    icon: Building2,
    title: "Doanh nghiệp",
    desc: "Đồng hành cùng doanh nghiệp vận hành hiệu quả hơn và nâng cao năng lực cạnh tranh.",
  },
  {
    icon: Users,
    title: "Người dùng",
    desc: "Xây dựng những sản phẩm số tiện lợi, góp phần nâng cao chất lượng cuộc sống mỗi ngày.",
  },
  {
    icon: Landmark,
    title: "Khu vực công",
    desc: "Phát triển giải pháp quản lý hiện đại, giúp các tổ chức phục vụ cộng đồng tốt hơn.",
  },
];

const About = () => {
  return (
    <div className="flex flex-col gap-20 pb-8">
      {/* ── Hero ── */}
      <section className="text-center max-w-3xl mx-auto pt-4">
        <span className="inline-block text-xs font-medium tracking-wide text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-5">
          Vietnam Z-DNA Technology
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-800 leading-tight">
          Dấu ấn công nghệ,
          <br className="hidden sm:block" /> khát vọng của một thế hệ mới
        </h1>
        <p className="mt-5 text-[15px] text-slate-500 leading-relaxed">
          VNZ không được xây dựng để gia công — chúng tôi được xây dựng để tạo
          ra sản phẩm, nền tảng và giải pháp mang dấu ấn riêng của người Việt
          trên bản đồ công nghệ thế giới.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link to="/recruitments">
              Gia nhập đội ngũ <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://www.vnzdna.com/" target="_blank" rel="noreferrer">
              Website VNZ <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* ── Câu chuyện ── */}
      <section className="max-w-3xl mx-auto">
        <p className="text-xs font-medium text-blue-600 mb-2">Câu chuyện VNZ</p>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Khởi nguồn từ một câu hỏi
        </h2>
        <div className="space-y-4 text-[15px] text-slate-500 leading-relaxed">
          <p>
            Việt Nam tự hào có rất nhiều kỹ sư giỏi, những con người âm thầm
            đứng sau vô số sản phẩm công nghệ trên thế giới. Nhưng làm ra công
            nghệ và sở hữu công nghệ của riêng mình là hai câu chuyện khác nhau
            — chỉ khi tạo ra sản phẩm, nền tảng và giải pháp của chính mình, một
            quốc gia mới thực sự để lại dấu ấn.
          </p>
          <p>
            Câu hỏi ấy là lý do VNZ ra đời, và cũng là ý nghĩa của cái tên{" "}
            <span className="font-medium text-slate-700">Vietnam Z-DNA</span> —
            đại diện cho một thế hệ người Việt lớn lên cùng Internet, mang khát
            vọng làm chủ công nghệ và tạo ra giá trị bằng chính năng lực của
            mình.
          </p>
        </div>
      </section>

      <Separator />

      {/* ── Đối tượng phục vụ ── */}
      <section className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-blue-600 mb-2">
            Công nghệ phục vụ xã hội
          </p>
          <h2 className="text-2xl font-semibold text-slate-800">
            Một hành trình, nhiều mắt xích
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {AUDIENCES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-800 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Giá trị cốt lõi ── */}
      <section className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-blue-600 mb-2">
            Nguyên tắc không đánh đổi
          </p>
          <h2 className="text-2xl font-semibold text-slate-800">
            Giá trị cốt lõi
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CORE_VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-medium text-slate-800 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-3">
          Muốn cùng VNZ kiến tạo dấu ấn?
        </h2>
        <p className="text-[15px] text-slate-500 mb-6">
          Chúng tôi luôn chào đón những người trẻ dám nghĩ, dám làm và muốn trực
          tiếp tạo ra giá trị của riêng mình.
        </p>
        <Button asChild>
          <Link to="/recruitments">
            Xem vị trí tuyển dụng <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default About;
