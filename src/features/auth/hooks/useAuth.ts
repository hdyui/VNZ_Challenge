import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../services";
import { useAuthStore } from "../store";
import { queryClient } from "@/lib/queryClient";
import { jwtDecode } from "jwt-decode";
import type {
  AuthResponse,
  ChangePasswordRequest,
  JwtPayload,
  LoginRequest,
} from "../type";

// export const useRegisterMutation = () => {
//   const navigate = useNavigate();
//   // Dùng để tạo, cập nhật hoặc xóa dữ liệu (POST, PUT, DELETE) lên server
//   return useMutation({
//     mutationFn: (userData: {
//       fullName: string;
//       email: string;
//       password: string; //truyền vào dư ko cần định nghĩa cũng k lỗi
//     }) => authApi.register(userData),

//     onSuccess: () => {
//       toast.success("Đăng ký thành công");
//       const from = (location as any)?.from?.pathname || "/profile";
//       navigate(from, { replace: true });
//     },

//     onError: (error: any) => {
//       toast.error(
//         error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại",
//       );
//       console.log(error.response?.data?.message);
//     },

//     onSettled: () => {
//       //có thể dùng để reset form hoặc các thao tác cleanup khác
//     },
//   });
// };

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (res) => {
      // console.log("hi");
      const decoded = jwtDecode<JwtPayload>(res.value.accessToken);
      //console.log(decoded);
      // console.log(`hi + ${res.value.accessToken}`);
      // console.log("chưa set thành công");
      setAuth({
        accessToken: res.value.accessToken,
        role: decoded.Role,
      });
      // console.log("đã set thành công rồi nha ");
      toast.success("Đăng nhập thành công");

      if (decoded.Role === "Admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/employee");
      }
      // console.log("navigate thành công");
    },
  });
};
export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => {
      return authApi.changePassword(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || "Đổi mật khẩu thành công!");
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.errors?.message ||
        error.response?.data?.message ||
        "Đổi mật khẩu thất bại, vui lòng kiểm tra lại!";
      toast.error(errorMsg);
      // console.log("Lỗi đổi pass:", error.response?.data);
    },
  });
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const clearTokens = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => {
      return authApi.logout();
    },

    onSuccess: () => {
      clearTokens();
      queryClient.removeQueries();

      // xóa 1 key thôi, vd khi update thì xóa key của 1 cái cũ thôi r add
      // queryClient.invalidateQueries({ queryKey: ["rituals"] });

      toast.success("Đăng xuất thành công");
      navigate("/login");
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Đăng xuất gặp sự cố, nhưng vẫn đăng xuất",
      );
      clearTokens();
      queryClient.removeQueries();
      console.log(error.response?.data?.message);
    },
  });
};

export const useUser = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["me"], // id của cache
    queryFn: authApi.getMe,
    enabled: !!accessToken,
    retry: false,
  });
};
