import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

interface TableViewProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
  sortingState?: SortingState;
}

export function TableView<T extends object>({
  data,
  columns,
  sortingState,
}: TableViewProps<T>) {
  const defaultValue = useMemo(() => [], []);
  const table = useReactTable({
    data: data ?? defaultValue,
    columns,
    state: {
      sorting: sortingState,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="z-0 w-full overflow-y-auto">
      <table className="mt-4">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b-2">
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-bold text-gray-900"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b-[1px]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
