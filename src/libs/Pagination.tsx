import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";

type Props = {
  totalPages: number;
  currentPage: number;
  onPageChange: (currentPage: number) => void;
}
export default function Pagination({totalPages, currentPage, onPageChange}: Props) {
  if (totalPages <= 1) return null;
  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);

    for (let i = start; i < end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
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
  return <div className="overflow-x-auto ">
    <div className="flex items-center gap-2 justify-center mt-4">
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
}