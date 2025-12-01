"use client";
import React, {useState, useCallback, useEffect} from "react";
import Button from "@/libs/Button";
import Table, {Column} from "@/libs/Table";
import {AlertType, CategoryStatus, ColorButton} from "@/types/enum";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChangeCircleRoundedIcon from '@mui/icons-material/ChangeCircleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Title from "@/libs/Title";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import CreateCategoryModal from "@/components/admin/categories/CreateCategoryModal";
import DetailCategoryModal from "@/components/admin/categories/DetailCategoryModal";
import UpdateCategoryModal from "@/components/admin/categories/UpdateCategoryModal";
import UpdateStatusCategoryModal from "@/components/admin/categories/UpdateStatusCategoryModal";
import useSWR from "swr";
import {CATEGORY} from "@/services/api";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";
import {useDebounce} from "@/hooks/useDebounce";
import {formatDateTime} from "@/util/FnCommon";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useBuildUrl} from "@/hooks/useBuildUrl";


interface ResCategorySearchDTO {
  categoryId: number;
  categoryName: string;
  description: string;
  categoryStatus: CategoryStatus;
  parentCategoryName: string;
  createdAt: string;
  updatedAt: string;
}

export default function Main() {
  const {get} = useAxiosContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ResCategorySearchDTO | null>(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState("10");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const debouncedKeyword = useDebounce(keyword, 500);

  const url = useBuildUrl({
    baseUrl: `${CATEGORY}/search`,
    queryParams: {
      keyword: debouncedKeyword?.trim() || undefined,
      status: status || undefined,
      pageNo: currentPage,
      pageSize,
      sortBy: sortBy || undefined,
      sortDir: sortDir || undefined,
    }
  });

  const {data, mutate, isLoading, error} = useSWR(
    url,
    (u: string) => get<BaseResponse<PageResponse<ResCategorySearchDTO>>>(u).then(res => res.data),
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if(error){
      const alert : AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải danh mục",
      }
      dispatch(openAlert(alert));
    }
  },[dispatch, error]);
  const statusOptions: Option[] = [
    {id: "", label: "Tất cả trạng thái"},
    {id: CategoryStatus.ACTIVE, label: "Hoạt động"},
    {id: CategoryStatus.INACTIVE, label: "Ngừng hoạt động"},
  ];

  const getStatusLabel = (status: CategoryStatus) => {
    switch (status) {
      case CategoryStatus.ACTIVE:
        return "Hoạt động";
      case CategoryStatus.INACTIVE:
        return "Ngừng hoạt động";
      default:
        return status;
    }
  };

  const getStatusColor = (status: CategoryStatus) => {
    switch (status) {
      case CategoryStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case CategoryStatus.INACTIVE:
        return ChipColor.SECONDARY;
      default:
        return ChipColor.SUCCESS;
    }
  };

  const highlightText = useCallback((text: string, keyword: string) => {
    if (!keyword || !text) return text;

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={`highlight-${i}`} className="bg-yellow-c200 text-grey-c900 rounded px-1">{part}</mark>
          ) : (
            <span key={`text-${i}`}>{part}</span>
          )
        )}
      </span>
    );
  }, []);

  const handleClearSearch = () => {
    setKeyword("");
    setStatus("");
    setCurrentPage(0);
  };

  const handleAddCategory = () => {
    setIsOpen(true);
  };

  const handleViewCategory = (id: number) => {
    setSelectedCategoryId(id);
    setIsDetailOpen(true);
  };

  const handleEditCategory = (id: number) => {
    setSelectedCategoryId(id);
    setIsUpdateOpen(true);
  };

  const handleUpdateStatus = (category: ResCategorySearchDTO) => {
    setSelectedCategory(category);
    setIsUpdateStatusOpen(true);
  };


  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setCurrentPage(0);
  };


  const columns: Column<ResCategorySearchDTO>[] = [
    {
      key: "categoryId",
      label: "ID",
      sortable: true,
      render: (category) => (
        <span className="text-sm text-grey-c900">
          {category.categoryId}
        </span>
      )
    },
    {
      key: "categoryName",
      label: "Tên danh mục",
      sortable: true,
      render: (category) => (
        <span className="text-sm font-semibold text-grey-c900">
          {highlightText(category.categoryName, keyword)}
        </span>
      )
    },
    {
      key: "description",
      label: "Mô tả",
      render: (category) => (
        <span className="text-sm text-grey-c700">
          {highlightText(category.description || "-", keyword)}
        </span>
      )
    },
    {
      key: "parentCategoryName",
      label: "Danh mục cha",
      render: (category) => (
        <span className="text-sm text-grey-c700">
          {category.parentCategoryName || <span className="text-grey-c400">-</span>}
        </span>
      )
    },
    {
      key: "categoryStatus",
      label: "Trạng thái",
      sortable: true,
      render: (category) => (
        <Chip
          label={getStatusLabel(category.categoryStatus)}
          variant={ChipVariant.SOFT}
          color={getStatusColor(category.categoryStatus)}
        />
      )
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (category) => (
        <span className="text-sm text-grey-c700">
          {formatDateTime(category.createdAt)}
        </span>
      )
    },
    {
      key: "actions",
      label: "Hành động",
      className: "text-center",
      render: (category) => (
        <div className="flex gap-2 ">
          <button
            onClick={() => handleViewCategory(category.categoryId)}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"
          >
            <VisibilityRoundedIcon/>
          </button>
          <button
            onClick={() => handleEditCategory(category.categoryId)}
            className="cursor-pointer p-2 text-yellow-c800 hover:bg-yellow-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Chỉnh sửa"
          >
            <EditRoundedIcon/>
          </button>
          <button
            onClick={() => handleUpdateStatus(category)}
            className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
            title="Đổi trạng thái"
          >
            <ChangeCircleRoundedIcon/>
          </button>
        </div>
      )
    }
  ];

  const pageData = data?.data;
  const categories = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <div>
      {isLoading && <Loading/>}
      <Title title="Quản lý danh mục" isDivide={true}/>

      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm theo tên, mô tả danh mục..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(0);
              }
            }}
          />
          {keyword && (
            <button
              onClick={handleClearSearch}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-grey-c200 rounded-full transition-all"
              title="Xóa tìm kiếm"
            >
              <ClearRoundedIcon className="text-grey-c600 text-xl"/>
            </button>
          )}
        </div>

        <div className="min-w-[200px]">
          <DropdownSelect
            value={status}
            onChange={(value) => {
              setStatus(value);
              setCurrentPage(0);
            }}
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
        </div>

        <Button
          onClick={handleAddCategory}
          color={ColorButton.SUCCESS}
          startIcon={<AddRoundedIcon/>}
        >
          Thêm danh mục
        </Button>
      </div>

      {(keyword || status) && (
        <div className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200">
          <SearchRoundedIcon className="text-primary-c700"/>
          <span>
            Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> danh mục
            {keyword && <> với từ khóa &ldquo;<strong className="text-primary-c800">{keyword}</strong>&rdquo;</>}
            {status && <> - Trạng thái: <strong className="text-primary-c800">{statusOptions.find(o => o.id === status)?.label}</strong></>}
          </span>
          <button
            onClick={handleClearSearch}
            className="ml-auto text-primary-c700 hover:text-primary-c900 underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <Table<ResCategorySearchDTO>
        columns={columns}
        data={categories}
        keyExtractor={(row) => row.categoryId}
        emptyMessage={
          keyword || status
            ? "Không tìm thấy danh mục phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
            : "Không có danh mục nào"
        }
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        setPageSize={handlePageSizeChange}
      />

      {isOpen && <CreateCategoryModal isOpen={isOpen} setIsOpen={setIsOpen} reload={mutate}/>}
      {isDetailOpen && selectedCategoryId !== null && (
        <DetailCategoryModal
          isOpen={isDetailOpen}
          setIsOpen={setIsDetailOpen}
          categoryId={selectedCategoryId}
        />
      )}
      {isUpdateOpen && selectedCategoryId !== null && (
        <UpdateCategoryModal
          isOpen={isUpdateOpen}
          setIsOpen={setIsUpdateOpen}
          categoryId={selectedCategoryId}
          reload={mutate}
        />
      )}
      {isUpdateStatusOpen && selectedCategory !== null && (
        <UpdateStatusCategoryModal
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          categoryId={selectedCategory.categoryId}
          currentStatus={selectedCategory.categoryStatus}
          categoryName={selectedCategory.categoryName}
          reload={mutate}
        />
      )}
    </div>
  );
}