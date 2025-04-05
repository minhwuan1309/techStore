import React, { memo } from "react"
import useBreadcrumbs from "use-react-router-breadcrumbs"
import { Link } from "react-router-dom"
import { IoIosArrowForward } from "react-icons/io"

const routes = [
  { path: "/", breadcrumb: "Trang chủ" },
  { 
    path: "/blogs",
    breadcrumb: "Bài viết"
  },
  {
    path: "/products",
    breadcrumb: "Sản phẩm"
  },
  {
    path: "/:category",
    breadcrumb: ({ match }) => {
      const category = decodeURIComponent(match.params.category)
      switch(category) {
        case 'blogs':
          return 'Bài viết'
        case 'products':
          return 'Sản phẩm'
        default:
          return category
      }
    }
  },
  {
    path: "/blogs/:id/:title",
    breadcrumb: ({ match }) => decodeURIComponent(match.params.title)
  },
  {
    path: "/products/:pid/:title",
    breadcrumb: ({ match }) => decodeURIComponent(match.params.title)
  }
]

const Breadcrumb = ({ title, category }) => {
  const breadcrumbs = useBreadcrumbs(routes)

  return (
    <div className="text-m flex items-center gap-2 py-2">
      {breadcrumbs?.map(({ match, breadcrumb }, index, self) => (
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
  )
}

export default memo(Breadcrumb)