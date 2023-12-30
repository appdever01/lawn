const noLayout = '../views/layouts/nothing.ejs'
const mainLayout = '../views/layouts/main.ejs'
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const jwtSecret = process.env.JWT_SECRET
const Services = require('../model/service')
const SelectedServices = require('../model/selected_services')
const {generateUniqueID} = require('../middleware/helper')

const CheckAuth = async (req, res) => {

    let is_user = false
    let is_admin = false
    try{
        const token = req.cookies.token;
        if(token) {
            is_user = true
            const decoded = jwt.verify(token, jwtSecret);
            //dont just find by Id, but by password
            const user = await User.findById(decoded.userId)
            if(user) {
                if(user.admin == true) is_admin = true
            }
        }
        return {is_user: is_user, is_admin}
    }  catch (error) {
        console.log(error)
        if(error instanceof jwt.JsonWebTokenError){
            res.clearCookie('token');
            return res.redirect('/login')
        }
        return {is_user: false, is_admin}
    }

}

const home = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)
    console.log( is_user, is_admin)

    res.render('home', {
        is_user, is_admin,
        layout: mainLayout,
        title: "Home",
        
    })
}

const membership = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    res.render('membership', {
        title: "Membership Program",
        layout: mainLayout,
        is_user, is_admin
    })
}

const contact = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    res.render('contact', {
        title: "Contact",
        layout: mainLayout,
        is_user, is_admin
    })
}

const services = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    res.render('services', {
        title: "Services",
        layout: mainLayout,
        is_user, is_admin
    })
}

const get_quote_page = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    const services = await Services.find({})
    res.render('get-quote', {
        title: "Get A Quote",
        layout: mainLayout,
        is_user, is_admin, services
    })
}


const get_quote = async (req, res) => {
    console.log("yes")
    const {email, address, number, date, service} = req.body
    const {userId} = req

    const user = await User.findById(userId)

    // generate unique ID
    var unique_id = await generateUniqueID()

    // check if id isnt present
    var check_uniqueId = await SelectedServices.find({id: unique_id})

    while(check_uniqueId.length > 0){
        unique_id = await generateUniqueID()
        check_uniqueId = await SelectedServices.find({id: unique_id})
    }


    const quotes = await SelectedServices.create({
        id: unique_id,
        customer: user.fullname,
        customer_email: email,
        customer_address: address,
        customer_phone: number,
        service: service,
        date_of_service: date,
        customerId: user._id
    })

    res.redirect('/dashboard/customer?success=Quote successfully sent. Wait for response')
   
}
module.exports = {
    home, membership,contact, CheckAuth,
    services, get_quote_page, get_quote
}