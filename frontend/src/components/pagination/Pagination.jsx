import React, { memo } from "react";
import usePagination from "hooks/usePagination";
import { PagiItem } from "components";
import { useSearchParams } from "react-router-dom";

const Pagination = ({ totalCount }) => {
  const [params] = useSearchParams();
  const currentPage = +params.get("page") || 1; // Mặc định là trang 1
  const pagination = usePagination(totalCount, currentPage);

  const range = () => {
    const currentPage = +params.get("page") || 1;
    const pageSize = 8; 
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);

    return `${start} - ${end}`;
  };


  return (
    <div className="flex w-full justify-between items-center">
      {/* Hiển thị tổng quan số lượng */}
      <span className="text-sm italic">{`${range()}/${totalCount}`}</span>

      {/* Danh sách các trang */}
      <div className="flex mt-8 lg:mt-0 items-center">
        {pagination?.map((el) => (
          <PagiItem key={el} active={el === currentPage}>
            {el}
          </PagiItem>
        ))}
      </div>
    </div>
  );
};

export default memo(Pagination);
