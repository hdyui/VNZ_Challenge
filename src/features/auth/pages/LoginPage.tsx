import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { LoginSchema, type LoginSchemaType } from "@/features/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/auth/hooks/useAuth";

export const LoginPage = () => {
  const loginMutation = useLoginMutation();
  const {
    register, // dùng để đăng ký các input vào form
    handleSubmit, // dùng để xử lý submit form, nó sẽ tự động gọi validate và trả về data đã được validate nếu hợp lệ
    formState: { errors },
  } = useForm<LoginSchemaType>({
    //mode: khi nao validate?
    mode: "onTouched",
    // - onSubmit: chỉ validate khi submit form
    // - onChange: validate ngay khi người dùng nhập dữ liệu vào input
    // - onBlur: validate khi người dùng rời khỏi input
    // - onTouched: validate khi người dùng rời khỏi input và đã tương tác với nó (touched)
    resolver: zodResolver(LoginSchema),
    // dùng để tích hợp Zod schema vào React Hook Form, nó sẽ tự động validate form dựa trên schema đã định nghĩa
    // chuyển định nghĩa schema của Zod thành resolver mà React Hook Form có thể hiểu được
    //defaul values: giá trị mặc định của form, nếu không có thì sẽ là undefined, nhưng nếu có thì sẽ giúp form có giá trị ban đầu và tránh lỗi uncontrolled component
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: LoginSchemaType) => {
    console.log(data);
    loginMutation.mutate(data);
  };

  return (
    <>
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex justify-center text-3xl font-extrabold">
              Đăng nhập
            </CardTitle>
            <CardDescription className="flex justify-center text-1xl font-extrabold">
              Nhập thông tin để tiếp tục
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>

                  <Input
                    disabled={loginMutation.isPending}
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>

                  <Input
                    disabled={loginMutation.isPending}
                    type="password"
                    placeholder="Nhập mật khẩu"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  {loginMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    Đăng ký
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
