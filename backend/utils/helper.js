export const fotmatPrice = (number) => Math.round(number / 1000) * 1000;

export const formatMoney = (number) =>
  Number(number?.toFixed(1)).toLocaleString();

export const slugify = (str) => {
  return str
    .replace(/đ/g, "d") // xử lý trước khi normalize
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w]+/g, "-")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}
