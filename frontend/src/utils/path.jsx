const path = {
  PUBLIC: "/",
  HOME: "",
  ALL: "*",
  LOGIN: "login",
  PRODUCTS__CATEGORY: ":category",
  BLOGS__ID__TITLE: "blogs/:id/:title",
  BLOGS: "blogs",
  OUR_SERVICES: "services",
  FAQ: "faqs",
  DETAIL_PRODUCT__CATEGORY__PID__TITLE: ":category/:pid/:title",
  FINAL_REGISTER: "finalregister/:status",
  RESET_PASSWORD: "reset-password/:token",
  DETAIL_CART: "my-cart",
  CHECKOUT: "checkout",
  PRODUCTS: "products",
  CONFIRM_ORDER: "confirm-order",
  CONFIRM_ORDER__OID: "confirm-order/:oid",

  // Admin
  ADMIN: "admin",
  DASHBOARD: "dashboard",
  ADMIN_PERSONAL: "admin-personal",
  MANAGE_USER: "manage-user",
  MANAGE_PRODUCTS: "manage-products",
  MANAGE_ORDER: "manage-order",
  CREATE_PRODUCTS: "create-products",
  CREATE_BLOG: "create-blog",
  MANAGE_BLOGS: "manage-blogs",
  CREATE_CATEGORY: "create-category",
  MANAGE_CATEGORIES: "manage-categories",
  MANAGE_COUPON: 'manage-coupon',
  MANAGE_BRANDS: 'manage-brands',
  CHAT: "chat",

  // Member
  MEMBER: "member",
  PERSONAL: "personal",
  MY_CART: "my-cart",
  HISTORY: "buy-history",
  WISHLIST: "wishlist",
};

export default path
