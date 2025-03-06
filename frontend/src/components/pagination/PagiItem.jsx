import clsx from "clsx";
import {
  useSearchParams,
  useNavigate,
  createSearchParams,
  useLocation,
} from "react-router-dom";
import { memo } from "react";

const PagiItem = ({ children }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();

  const currentPage = +params.get("page") || 1; // Mặc định là trang 1 nếu không có `page`

  const handlePagination = () => {
    const queries = Object.fromEntries([...params]);
    queries.page = children; // Cập nhật tham số `page`
    navigate({
      pathname: location.pathname,
      search: createSearchParams(queries).toString(),
    });
  };

  return (
    <button
      className={clsx(
        "w-10 h-10 flex justify-center items-center",
        "hover:rounded-full hover:bg-gray-300 transition-all",
        currentPage === +children && "rounded-full bg-gray-300 font-bold", // Đánh dấu trang hiện tại
        !Number(children) && "items-end pb-2 cursor-default text-gray-500" // Nút không hợp lệ
      )}
      onClick={handlePagination}
      type="button"
      disabled={!Number(children)} // Vô hiệu hóa nút không hợp lệ
    >
      {children}
    </button>
  );
};

export default memo(PagiItem);
