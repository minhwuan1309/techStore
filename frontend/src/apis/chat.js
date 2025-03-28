import axios from "../axios"

export const apiGetChats = (params) => 
  axios({
    url: "/chat",
    method: "get",
    params
  })

export const apiGetChatWith = (userId) => 
  axios({
    url: `/chat/${userId}`,
    method: "get"
  })

export const apiSendMessage = (data) => 
  axios({
    url: "/chat",
    method: "post",
    data
  })

export const apiMarkMessagesAsRead = (chatId) => 
  axios({
    url: `/chat/${chatId}/read`,
    method: "patch"
  })