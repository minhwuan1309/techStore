import path from "./path"
import icons from "./icons"
import { RiChatSmile3Line, RiCoupon2Fill } from "react-icons/ri";

export const navigation = [
  {
    id: 1,
    value: "TRANG CHÍNH",
    path: `/${path.HOME}`,
  },
  {
    id: 2,
    value: "SẢN PHẨM",
    path: `/${path.PRODUCTS}`,
  },
  {
    id: 3,
    value: "BÀI VIẾT",
    path: `/${path.BLOGS}`,
  },
  {
    id: 4,
    value: "FAQs",
    path: `/${path.FAQ}`,
  },
]
const { RiTruckFill, BsShieldShaded, BsReplyFill, FaTty, AiFillGift } = icons
export const productExtraInfomation = [
  {
    id: "1",
    title: "Bảo hành",
    sub: "Kiểm tra chất lượng",
    icon: <BsShieldShaded />,
  },
  {
    id: "2",
    title: "Miễn phí vận chuyển",
    sub: "Miễn phí cho tất cả sản phẩm",
    icon: <RiTruckFill />,
  },
  {
    id: "3",
    title: "Thẻ quà tặng đặc biệt",
    sub: "Thẻ quà tặng đặc biệt",
    icon: <AiFillGift />,
  },
  {
    id: "4",
    title: "Đổi trả miễn phí",
    sub: "Trong vòng 7 ngày",
    icon: <BsReplyFill />,
  },
  {
    id: "5",
    title: "Tư vấn",
    sub: "Hỗ trợ 24/7",
    icon: <FaTty />,
  },
];


export const productInfoTabs = [
  {
    id: 1,
    name: "MÔ TẢ",
    content: `Công nghệ: GSM / HSPA / LTE
        Kích thước: 153.8 x 75.5 x 7.6 mm
        Trọng lượng: 154 g
        Màn hình: IPS LCD 5.5 inches
        Độ phân giải: 720 x 1280
        Hệ điều hành: Android OS, v6.0 (Marshmallow)
        Chipset: Octa-core
        CPU: Octa-core
        Bộ nhớ trong: 32 GB, 4 GB RAM
        Camera: 13MP - 20 MP`,
  },
  {
    id: 2,
    name: "BẢO HÀNH",
    content: `THÔNG TIN BẢO HÀNH
        BẢO HÀNH CÓ GIỚI HẠN
        Bảo hành có giới hạn không thể chuyển nhượng. Bảo hành có giới hạn sau đây được cấp cho người mua bán lẻ ban đầu của các sản phẩm Ashley Furniture Industries, Inc. như sau:
        
        Khung sử dụng trong sản phẩm bọc vải và da
        Bảo hành suốt đời có giới hạn
        Bảo hành suốt đời có giới hạn áp dụng cho tất cả các khung được sử dụng trong ghế sofa, ghế dài, ghế yêu, ghế bọc, ghế ottoman, ghế góc và giường. Ashley Furniture Industries, Inc. bảo hành các thành phần này cho bạn, người mua bán lẻ ban đầu, rằng chúng không có lỗi sản xuất vật liệu.`,
  },
  {
    id: 3,
    name: "VẬN CHUYỂN",
    content: `MUA HÀNG & VẬN CHUYỂN
        Trước khi mua, bạn nên biết kích thước của khu vực bạn định đặt đồ nội thất. Bạn cũng nên đo kích thước của cửa ra vào và hành lang mà sản phẩm sẽ đi qua để đến vị trí cuối cùng.
        Lấy hàng tại cửa hàng
        Cửa hàng Shopify yêu cầu tất cả các sản phẩm phải được kiểm tra kỹ lưỡng TRƯỚC KHI bạn mang về nhà để đảm bảo không có bất ngờ. Đội ngũ của chúng tôi rất vui khi mở tất cả các gói hàng và sẽ hỗ trợ trong quá trình kiểm tra. Sau đó, chúng tôi sẽ niêm phong lại các gói hàng để vận chuyển an toàn. Chúng tôi khuyến khích tất cả khách hàng mang...`,
  },
];


export const colors = [
  "Đen",
  "Nâu",
  "Xám",
  "Trắng",
  "Hồng",
  "Vàng",
  "Cam",
  "Tím",
  "Xanh lá",
  "Xanh",
];

export const sorts = [
  {
    id: 1,
    value: "-sold",
    text: "Bán chạy",
  },
  {
    id: 2,
    value: "-title",
    text: " A-Z",
  },
  {
    id: 3,
    value: "title",
    text: "Z-A",
  },
  {
    id: 4,
    value: "-price",
    text: "Giá, cao - thấp ",
  },
  {
    id: 5,
    value: "price",
    text: "Giá, thấp - cao ",
  },
  {
    id: 6,
    value: "-createdAt",
    text: "Mới",
  },
  {
    id: 7,
    value: "createdAt",
    text: "Cũ",
  },
]

export const voteOptions = [
  {
    id: 1,
    text: "Rất Tệ",
  },
  {
    id: 2,
    text: "Tệ",
  },
  {
    id: 3,
    text: "Trung",
  },

  {
    id: 4,
    text: "Khá",
  },

  {
    id: 5,
    text: "Tốt",
  },
]
const { AiOutlineDashboard, MdGroups, TbBrandProducthunt, RiBillLine } = icons
export const adminSidebar = [
  {
    id: 1,
    type: "SINGLE",
    text: "Tổng quát",
    path: `/${path.ADMIN}/${path.DASHBOARD}`,
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    id: 2,
    type: "SINGLE",
    text: "Quản lý tài khoản",
    path: `/${path.ADMIN}/${path.MANAGE_USER}`,
    icon: <MdGroups size={20} />,
  },
  {
    id: 3,
    type: "PARENT",
    text: "Sản phẩm",
    icon: <TbBrandProducthunt size={20} />,
    submenu: [
      {
        text: "Thêm sản phẩm mới",
        path: `/${path.ADMIN}/${path.CREATE_PRODUCTS}`,
      },
      {
        text: "Quản lý sản phẩm",
        path: `/${path.ADMIN}/${path.MANAGE_PRODUCTS}`,
      },
    ],
  },
  {
    id: 4,
    type: "SINGLE",
    text: "Quản lý đơn hàng",
    path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
    icon: <RiBillLine size={20} />,
  },
  {
    id: 5,
    type: "PARENT",
    text: "Loại sản phẩm",
    icon: <TbBrandProducthunt size={20} />,
    submenu: [
      {
        text: "Thêm loại sản phẩm",
        path: `/${path.ADMIN}/${path.CREATE_CATEGORY}`,
      },
      {
        text: "Quản lý loại sản phẩm",
        path: `/${path.ADMIN}/${path.MANAGE_CATEGORIES}`,
      },
    ],
  },
  
  {
    id: 6,
    type: "PARENT",
    text: "Bài viết",
    icon: <TbBrandProducthunt size={20} />,
    submenu: [
      {
        text: "Tạo bài viết",
        path: `/${path.ADMIN}/${path.CREATE_BLOG}`,
      },
      {
        text: "Quản lý bài viết",
        path: `/${path.ADMIN}/${path.MANAGE_BLOGS}`,
      },
    ],
  },
  {
    id: 7,
    type: "SINGLE",
    text: "Chat",
    path: `/${path.ADMIN}/${path.CHAT}`,
    icon: <RiChatSmile3Line size={20} />,
  },
  {
    id: 8,
    type: "SINGLE",
    text: "Khuyến mãi",
    path: `/${path.ADMIN}/${path.MANAGE_COUPON}`,
    icon: <RiCoupon2Fill size={20}/>
  },
];
export const memberSidebar = [
  {
    id: 1,
    type: "SINGLE",
    text: "Thông tin cá nhân",
    path: `/${path.MEMBER}/${path.PERSONAL}`,
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    id: 2,
    type: "SINGLE",
    text: "Giỏ hàng",
    path: `/${path.MEMBER}/${path.MY_CART}`,
    icon: <MdGroups size={20} />,
  },
  {
    id: 4,
    type: "SINGLE",
    text: "Lịch sử mua hàng",
    path: `/${path.MEMBER}/${path.HISTORY}`,
    icon: <RiBillLine size={20} />,
  },
  {
    id: 5,
    type: "SINGLE",
    text: "Danh sách yêu thích",
    path: `/${path.MEMBER}/${path.WISHLIST}`,
    icon: <RiBillLine size={20} />,
  },
]

export const roles = [
  {
    code: 1945,
    value: "Admin",
  },
  {
    code: 1980,
    value: "Employee",
  },
  {
    code: 1979,
    value: "User",
  },
];

export const blockStatus = [
  {
    code: true,
    value: "Blocked",
  },
  {
    code: false,
    value: "Active",
  },
]
export const statusOrders = [
  {
    label: "Cancelled",
    value: "Cancelled",
  },
  {
    label: "Succeed",
    value: "Succeed",
  },
];
