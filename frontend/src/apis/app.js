import axios from "../axios"

export const apiGetBrands = () =>
  axios({
    url: "/brand/",
    method: "get",
  })
export const apiGetDashboard = (params) =>
  axios({
    url: "/order/dashboard",
    method: "get",
    params,
  })

