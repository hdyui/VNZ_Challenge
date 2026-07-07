import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useDepartmentDetail,
  useAddUserToDepartment,
  useRemoveUserFromDepartment,
} from "../hooks/useDepartment";
import { DepartmentStatusBadge } from "../components/DepartmentStatusBadge";
import { Loader2, UserPlus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { DepartmentMember } from "../types";

export const DepartmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data, isLoading, isError } = useDepartmentDetail(id!);
  const { mutate: addUser, isPending: isAddingUser } = useAddUserToDepartment(
    id!,
  );
  const {
    mutate: removeUser,
    isPending: isRemovingUser,
    variables: removingUserId,
  } = useRemoveUserFromDepartment(id!);

  // (Lưu ý: Nếu backend của bạn dùng endpoint khác như /accounts thì đổi chữ /users thành /accounts nhé)
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["all-users"],
    queryFn: () =>
      apiClient
        .get("/users", {
          params: { pageSize: 99 },
        })
        .then((res: any) => res.value?.items || []),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        Đang tải thông tin...
      </div>
    );
  }

  if (isError || !data?.value) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-500">
        <p>Không tìm thấy phòng ban.</p>
        <Link
          to="/admin/departments"
          className="text-blue-600 hover:underline text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const department = data.value;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    addUser(
      { userId: selectedUserId },
      { onSuccess: () => setSelectedUserId("") },
    );
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân sự này khỏi phòng ban?")) {
      removeUser(userId);
    }
  };

  const memberColumns: ColumnDef<DepartmentMember>[] = [
    {
      header: "Họ tên",
      cell: (item) => (
        <span className="font-medium text-gray-800">
          {item.lastName} {item.firstName}
        </span>
      ),
    },
    {
      header: "Vị trí",
      cell: (item) => (
        <span className="text-gray-600">{item.position || "Nhân viên"}</span>
      ),
    },
    {
      header: "Ngày tham gia",
      cell: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.joinedAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      header: "Thao tác",
      cell: (item) => (
        <button
          onClick={() => handleRemoveUser(item.userId)}
          disabled={isRemovingUser && removingUserId === item.userId}
          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
          title="Xóa nhân sự"
        >
          {isRemovingUser && removingUserId === item.userId ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <Link
          to="/admin/departments"
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2"
        >
          ← Quay lại danh sách
        </Link>
        <Link to={`/admin/departments/update/${department.id}`}>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Chỉnh sửa phòng ban
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin phòng ban giữ nguyên... */}
        <Card className="shadow-sm border-gray-200 lg:col-span-1 h-fit">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-lg">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Mã PB</p>
              <p className="font-semibold text-gray-900">
                {department.departmentCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tên PB</p>
              <p className="font-semibold text-gray-900">{department.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <div className="mt-1">
                <DepartmentStatusBadge isActive={department.isActive} />
              </div>
            </div>
            {department.description && (
              <div>
                <p className="text-sm text-gray-500">Mô tả</p>
                <div
                  className="text-gray-700 text-sm mt-1 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: department.description }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quản lý nhân sự */}
        <Card className="shadow-sm border-gray-200 lg:col-span-2">
          <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg m-0">
              Nhân sự ({department.members?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* GIAO DIỆN SELECT CHỌN NHÂN VIÊN MỚI */}
            <form onSubmit={handleAddUser} className="flex gap-3 mb-6">
              <div className="w-full max-w-sm">
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={isLoadingUsers}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingUsers
                          ? "Đang tải danh sách..."
                          : "Chọn nhân viên để thêm..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData && usersData.length > 0 ? (
                      usersData.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}{" "}
                          {u.email ? `- ${u.email}` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-gray-500 text-center">
                        Không có dữ liệu nhân viên
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={!selectedUserId || isAddingUser}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAddingUser ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Thêm vào PB
              </Button>
            </form>

            {/* Bảng nhân sự */}
            {!department.members || department.members.length === 0 ? (
              <div className="py-12 text-center text-gray-400 border rounded-lg border-dashed">
                Phòng ban này chưa có nhân sự nào.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <DataTable data={department.members} columns={memberColumns} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
