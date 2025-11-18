import React from "react";
import DropdownSelect from "@/libs/DropdownSelect";
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;

  // Sorting
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (column: string) => void;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: string;
  setPageSize?: (size: string) => void;

  // Styling
  className?: string;
  emptyMessage?: string;

}

const pageSizeOptions: Option[] = [
  { id: "5", label: "5 dòng/trang" },
  { id: "10", label: "10 dòng/trang" },
  { id: "20", label: "20 dòng/trang" },
  { id: "50", label: "50 dòng/trang" },
];

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  sortBy = "",
  sortDir = "desc",
  onSort,
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  pageSize = "10",
  setPageSize,
  className = "",
  emptyMessage = "Không có dữ liệu",
}: TableProps<T>) {
  const renderSortIcon = (column: string) => {
    console.log("Rendering sort icon for column:", column, "with sortBy:", sortBy, "and sortDir:", sortDir);
    if (sortBy !== column) {
      return <span className="w-4 h-4 inline-block ml-1"></span>;
    }

    if (sortDir === "asc") {
      return (
        <svg className="w-4 h-4 inline-block ml-1 text-primary-c900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 inline-block ml-1 text-primary-c900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    const start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);

    for (let i = start; i < end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange?.(i)}
          className={`cursor-pointer px-4 py-2 mx-1 rounded-lg transition-colors ${
            currentPage === i
              ? "bg-primary-c700 text-white font-bold"
              : "bg-grey-c100 text-grey-c700 hover:bg-grey-c200"
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={`${className} flex flex-col`}>
      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-grey-c200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-c100 border-b-2 border-primary-c300">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && onSort?.(column.key)}
                    className={`px-6 py-4 text-left text-sm font-bold text-primary-c900 whitespace-nowrap ${
                      column.sortable
                        ? "cursor-pointer hover:bg-primary-c200 transition-colors duration-200"
                        : ""
                    } ${column.className || ""}`}
                  >
                    <div className={"flex flex-row items-center"}>{column.label}
                      {column.sortable && renderSortIcon(column.key)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-c200">
              { data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-grey-c600">
                    <div className={"flex flex-col items-center justify-center gap-4"}>
                      <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                          <ellipse fill="#f3f3f3" cx="32" cy="33" rx="32" ry="7"></ellipse>
                          <g fillRule="nonzero" stroke="#d9d9d9">
                            <path
                              d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                            <path
                              d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                              fill="#fafafa"
                            ></path>
                          </g>
                        </g>
                      </svg>
                      {emptyMessage}</div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={keyExtractor(row)} className={"hover:bg-primary-c50 transition-colors"}>
                    {columns.map((column) => (
                      <td key={column.key} className={`px-6 py-4 whitespace-nowrap ${column.className || ""}`}>
                        {column.render
                          ? column.render(row)
                          : ((row as Record<string, unknown>)[column.key]?.toString() || "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
        {/* Page Size Selector */}
        {setPageSize && (
          <div className="w-48">
            <DropdownSelect
              value={pageSize}
              onChange={(value) => setPageSize(value)}
              options={pageSizeOptions}
              align={"top"}
            />
          </div>
        )}

        {/* Pagination Buttons */}
        {totalPages > 1 && onPageChange && (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(0)}
                disabled={currentPage === 0}
                className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Trang đầu"
              >
                <KeyboardDoubleArrowLeftRoundedIcon/>
              </button>
              <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <KeyboardArrowLeftRoundedIcon/>
              </button>
              {renderPagination()}
              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Trang sau"
              >
                <KeyboardArrowRightRoundedIcon/>
              </button>
              <button
                onClick={() => onPageChange(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
                className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-grey-c300 text-grey-c700 hover:bg-grey-c100 hover:border-primary-c500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Trang cuối"
              >
                <KeyboardDoubleArrowRightRoundedIcon/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
