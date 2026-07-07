import type { ReactNode } from "react";

// Định nghĩa kiểu dữ liệu cho cột
export interface ColumnDef<T> {
  header: ReactNode;
  accessorKey?: keyof T; // Key lấy từ data
  cell?: (item: T) => ReactNode; // Custom render (VD: render trạng thái, nút action)
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div
      className={`overflow-x-auto border rounded-lg shadow-sm bg-white ${className ?? ""}`.trim()}
    >
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-6 py-3 font-medium text-gray-700 ${col.headerClassName ?? ""}`.trim()}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap ${col.cellClassName ?? ""}`.trim()}
                  >
                    {/* Nếu có hàm cell custom thì dùng, không thì render thẳng text từ accessorKey */}
                    {col.cell
                      ? col.cell(item)
                      : String(item[col.accessorKey as keyof T] || "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
