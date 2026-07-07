export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function calculateShiftDurationMinutes(
  startTime: string,
  endTime: string,
): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  // Ca qua đêm: endTime nhỏ hơn/bằng startTime => cộng thêm 1 ngày (24h)
  const duration = end > start ? end - start : end + 24 * 60 - start;
  return duration;
}

export function formatDuration(startTime: string, endTime: string): string {
  const minutes = calculateShiftDurationMinutes(startTime, endTime);
  if (minutes <= 0) return "--";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h${mins}p`;
}

// Bỏ giây khi hiển thị: "08:00:00" -> "08:00"
export function formatTimeShort(time: string): string {
  return time?.slice(0, 5) ?? "";
}
