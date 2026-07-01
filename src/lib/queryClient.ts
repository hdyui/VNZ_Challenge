import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🎛️ Config mặc định cho TẤT CẢ queries

      // 1. Refetch on Window Focus
      refetchOnWindowFocus: "always",
      // điều kiện fetch
      // -> 1. có component dùng data đó
      // -> 2. dữ liệu cũ ( ở tab đó thì vẫn re-fetch )

      // ⚠️ Mặc định: true (tự fetch lại khi user quay lại tab)
      // 💡 Học: Tắt để dễ debug (log đỡ nhảy loạn)
      // 💡 Production: Bật lại để data luôn tươi

      // 2. Retry Failed Requests
      retry: 1,
      // ⚠️ Mặc định: 3 lần
      // 💡 Học: Giảm xuống 1 để nhanh thấy lỗi
      // 💡 Production: 2-3 là hợp lý (network chập chờn)

      // 3. Stale Time
      staleTime: 10000,
      // ⚠️ Mặc định: 0 (data ngay lập tức "cũ")
      // 💡 Production: 30s - 5 phút tùy data
      // cơ chế Pooling dùng để ứng dụng chuyển khoản ( fetch liên tục bắt thay đổi số dư )

      // 4. Cache Time (GC Time)
      gcTime: 5 * 60 * 1000,
      // ⚠️ Mặc định: 5 phút
      // 💡 Cache tồn tại 5 phút kể từ khi không còn component nào dùng
    },

    //
  },
});
