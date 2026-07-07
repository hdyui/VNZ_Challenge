import { formatTimeShort } from "../utils/shiftValidation.util";

interface ShiftDayTimelineProps {
  startTime: string;
  endTime: string;
  size?: "sm" | "md";
  className?: string;
}

const DAY_COLOR = "#F2A93B"; // ca chủ yếu diễn ra ban ngày (06:00 - 18:00)
const NIGHT_COLOR = "#4C5FD5"; // ca chủ yếu diễn ra ban đêm

function toHours(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h + m / 60;
}

const toPct = (h: number) => `${(h / 24) * 100}%`;

/**
 * Phân loại một ca làm là "ca ngày" hay "ca đêm" dựa trên điểm giữa của ca.
 * Dùng chung cho ShiftDayTimeline và các nơi khác cần hiển thị nhãn/màu tương ứng.
 */
export function getShiftPeriod(
  startTime: string,
  endTime: string,
): { isDay: boolean; color: string; label: string } | null {
  const start = toHours(formatTimeShort(startTime));
  const end = toHours(formatTimeShort(endTime));
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  const wraps = end <= start;
  const span = wraps ? end + 24 - start : end - start;
  const midpoint = (start + span / 2) % 24;
  const isDay = midpoint >= 6 && midpoint < 18;

  return {
    isDay,
    color: isDay ? DAY_COLOR : NIGHT_COLOR,
    label: isDay ? "Ca ngày" : "Ca đêm",
  };
}

function SunGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="3.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.4 4.6l-1.4 1.4M6 14l-1.4 1.4M15.4 15.4l-1.4-1.4M6 6 4.6 4.6" />
      </g>
    </svg>
  );
}

function MoonGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M16 12.4A6.8 6.8 0 0 1 7.6 4a6.8 6.8 0 1 0 8.4 8.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Dải trực quan biểu diễn vị trí ca làm trong một ngày 24h.
 * Nền là một vệt gradient ngày/đêm liên tục (giữa đêm → sáng → trưa → chiều → đêm),
 * đoạn thời gian của ca được làm nổi bật phía trên để dễ so sánh giữa các ca.
 * Tự động xử lý ca xuyên đêm (giờ kết thúc nhỏ hơn giờ bắt đầu).
 */
export default function ShiftDayTimeline({
  startTime,
  endTime,
  size = "sm",
  className = "",
}: ShiftDayTimelineProps) {
  const start = toHours(formatTimeShort(startTime));
  const end = toHours(formatTimeShort(endTime));

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  const period = getShiftPeriod(startTime, endTime);
  const wraps = end <= start;
  const color = period?.color ?? DAY_COLOR;

  const isMd = size === "md";
  const height = isMd ? "h-3" : "h-1.5";
  const width = isMd ? "w-full" : "w-24";

  return (
    <div className={`${width} ${className}`}>
      <div
        className={`relative ${height} w-full overflow-hidden rounded-full ring-1 ring-inset ring-black/[0.03]`}
        style={{
          background:
            "linear-gradient(90deg, #3745A6 0%, #4C5FD5 12%, #93A0EE 25%, #FBD897 37%, #F2A93B 50%, #FBD897 63%, #93A0EE 75%, #4C5FD5 88%, #3745A6 100%)",
        }}
        aria-hidden="true"
      >
        {/* Lớp mờ làm dịu nền gradient, để đoạn ca làm active nổi bật phía trên */}
        <div className="absolute inset-0 bg-white/60" />

        {[6, 12, 18].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-white/80"
            style={{ left: toPct(tick) }}
          />
        ))}

        {wraps ? (
          <>
            <div
              className="absolute top-0 bottom-0 rounded-l-full shadow-sm ring-1 ring-inset ring-black/10"
              style={{ left: toPct(start), right: 0, backgroundColor: color }}
            />
            <div
              className="absolute top-0 bottom-0 rounded-r-full shadow-sm ring-1 ring-inset ring-black/10"
              style={{ left: 0, width: toPct(end), backgroundColor: color }}
            />
          </>
        ) : (
          <div
            className="absolute top-0 bottom-0 rounded-full shadow-sm ring-1 ring-inset ring-black/10"
            style={{
              left: toPct(start),
              width: toPct(end - start),
              backgroundColor: color,
            }}
          />
        )}
      </div>

      {isMd && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium tabular-nums text-slate-400">
          <span className="flex items-center gap-1">
            <MoonGlyph className="h-3 w-3 text-[#4C5FD5]" />
            00:00
          </span>
          <span className="flex items-center gap-1">
            <SunGlyph className="h-3 w-3 text-[#F2A93B]" />
            12:00
          </span>
          <span className="flex items-center gap-1">
            <MoonGlyph className="h-3 w-3 text-[#4C5FD5]" />
            24:00
          </span>
        </div>
      )}
    </div>
  );
}
