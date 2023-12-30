const express = require('express')
const router = express.Router()

const {
    login, register, logout, postLogin, postRegister
} = require('../controllers/user')

router.get('/login', login)
router.get('/register', register)
router.get('/logout', logout)
router.post('/login', postLogin)
router.post('/register', postRegister)


module.exports = router