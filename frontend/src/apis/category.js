import axios from "../axios";
export const apiGetCategories = () =>
  axios({
    url: "/prodcategory/",
    method: "get",
  });

export const apiCreateCategory = (data) =>
  axios({
    url: "/prodcategory/",
    method: "post",
    data,
  });

export const apiGetCategoryById = (id) =>
  axios({
    url: "/prodcategory/" + id,
    method: "get",
  });

export const apiDeleteCategory = (id) =>
  axios({
    url: "/prodcategory/" + id,
    method: "delete",
  });

export const apiUpdateCategory = (data, pid) =>
  axios({
    url: "/prodcategory/" + pid,
    method: "put",
    data,
  });


