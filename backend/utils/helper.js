export const fotmatPrice = (number) => Math.round(number / 1000) * 1000;

export const formatMoney = (number) =>
  Number(number?.toFixed(1)).toLocaleString();