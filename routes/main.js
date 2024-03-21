const express = require('express')
const router = express.Router()

const {authMiddleware, authAdmin, notAdmin} = require('../middleware/authentication.js')


const {
    home, membership, contact, services, get_quote_page, get_quote, instantEstimate, postInstantEstimate, payment_page, charge, test

} = require('../controllers/main')

router.get('/', home)
router.get('/membership', membership)
router.get('/contact', contact)
router.get('/services', services)
router.get('/get-a-quote', authMiddleware, notAdmin, get_quote_page)
router.post('/get-a-quote',authMiddleware, notAdmin, get_quote)
router.get('/instant-estimate', instantEstimate)
router.post('/instant-estimate', postInstantEstimate)
router.get('/payment/:id', authMiddleware, payment_page)
router.post('/charge/:id',authMiddleware,  charge)
router.get('/test', test)







module.exports = router