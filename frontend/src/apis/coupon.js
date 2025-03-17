import axios from "../axios";

export const apiGetCoupons = () =>
    axios({
        url: "/coupon/",
        method: "get",
    })

export const apiCreateCoupon = (data) =>
    axios({
        url: "/coupon/",
        method: "post",
        data
    })

export const apiUpdateCoupon = (cid,data) =>
    axios({
        url: `/coupon/${cid}`,
        method: "put",
        data
    })

export const apiDeleteCoupon = (cid) =>
    axios({
        url: `/coupon/${cid}`,
        method: "delete",
    })

export const apiCheckCoupon = (couponCode) =>
    axios({
        url: `/coupon/check/`,
        method: "post",
        data: {couponCode} 
    })
