import axios from "../axios"

export const apiGetDashboard = (params) =>
  axios({
    url: "/order/dashboard",
    method: "get",
    params,
  })

