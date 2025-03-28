import axios from "../axios"
export const apiGetBrands = (params) =>
  axios({
    url: "/brand/",
    method: "get",
    params,
  })

export const apiCreateBrand = (data) =>
  axios({
    url: "/brand/",
    method: "post",
    data,
  })

export const apiGetBrandById = (id) =>
  axios({
    url: "/brand/" + id,
    method: "get",
  })

export const apiDeleteBrand = (id) =>
  axios({
    url: "/brand/" + id,
    method: "delete",
  })

export const apiUpdateBrand = (data, id) =>
  axios({
    url: "/brand/" + id,
    method: "put",
    data,
  })
