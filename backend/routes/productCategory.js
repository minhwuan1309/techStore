const router = require('express').Router()
const ctrls = require('../controllers/productCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')


router.post('/', [verifyAccessToken, isAdmin], uploader.single('image') ,ctrls.createCategory)
router.get('/', ctrls.getCategories)
router.get("/:pcid", ctrls.getCategoryById);
router.put('/:pcid', [verifyAccessToken, isAdmin], uploader.single('image'), ctrls.updateCategory)
router.delete('/:pcid', [verifyAccessToken, isAdmin], ctrls.deleteCategory)




module.exports = router