const router = require("express").Router()
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken")
const ctrls = require("../controllers/order")

router.post("/", verifyAccessToken, ctrls.createOrder)
router.put("/status/:oid", verifyAccessToken, isAdmin, ctrls.updateStatus)
router.get("/admin", verifyAccessToken, isAdmin, ctrls.getOrders)
router.get("/admin/deleted", verifyAccessToken, isAdmin, ctrls.getDeletedOrders)
router.get("/dashboard",verifyAccessToken, isAdmin, ctrls.getDashboard)
router.get("/", verifyAccessToken, ctrls.getUserOrders)
router.put(
  "/admin/:id",
  verifyAccessToken,
  isAdmin,
  ctrls.deleteOrderByAdmin
)
router.get('/confirm/:oid', ctrls.confirmOrder) 


module.exports = router
