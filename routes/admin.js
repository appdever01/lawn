const express = require('express')
const router = express.Router()

const multer = require('multer');
const {authMiddleware, authAdmin, notAdmin} = require('../middleware/authentication.js')

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },  
    fileFilter: (req, file, cb) => {
        const list_of_accepted_type = ['image/jpeg',  'image/png',  'image/gif',  'image/bmp',  'image/tiff',  'image/webp',  'image/svg+xml']
        if(list_of_accepted_type.includes(file.mimetype)){
        cb(null, true)
        } else {
        cb(new Error('Only Images Allowed'), false)
        // cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE_TYPE"), false)
        }
    }
})

const {
    admin_dashboard, customer_dashboard, 
    single_quote,
    add_service_page,
    add_service,
    set_price_page,
    set_price
} = require('../controllers/admin')

router.get('/admin', authMiddleware, authAdmin, admin_dashboard)
router.get('/customer', authMiddleware, notAdmin, customer_dashboard)
router.get('/quote/:id', authMiddleware,  single_quote)
router.get('/add-service', authMiddleware, authAdmin, add_service_page)
router.post('/add-service', authMiddleware, authAdmin, upload.single('file'), add_service)
router.get('/set-price/:id', authMiddleware, authAdmin, set_price_page)
router.post('/set-price/:id', authMiddleware, authAdmin, set_price)








module.exports = router