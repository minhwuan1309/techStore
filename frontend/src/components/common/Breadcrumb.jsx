import React, { memo } from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { slugToTitleMap } from "utils/helpers";

const Breadcrumb = ({ title, category }) => {
  const routes = [
    {
      path: "/:category",
      breadcrumb: ({ match }) => {
        const slug = match.params.category;
        const decodedCategory = decodeURIComponent(slug); // Giải mã URL
        if (decodedCategory === "products") return "Sản phẩm";
        if (decodedCategory === "blogs") return "Bài viết";
        return slugToTitleMap[slug] || decodedCategory;
      },
    },
    { path: "/", breadcrumb: "Trang chính" },
    {
      path: "/:category/:pid/:title",
      breadcrumb: ({ match }) => {
        title = decodeURIComponent(match.params.title); // Giải mã URL
        return title; // Hiển thị tên sản phẩm
      },
    },
  ];
  const breadcrumb = useBreadcrumbs(routes);
  return (
    <div className="text-m flex items-center gap-2 py-2">
      {breadcrumb?.map(({ match, breadcrumb }, index, self) => (
        <Link
          className="flex gap-1 items-center hover:text-main"
          key={match.pathname}
          to={match.pathname}
        >
          <span className="capitalize">{breadcrumb}</span>
          {index !== self.length - 1 && <IoIosArrowForward />}
        </Link>
      ))}
    </div>
  );
};

export default memo(Breadcrumb);
