const express = require('express')
const router = express.Router()

const {
    instant_estimate
} = require('../controllers/api')

router.get('/instant_estimate', instant_estimate)

module.exports = router