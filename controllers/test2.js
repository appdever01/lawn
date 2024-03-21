const noLayout = '../views/layouts/nothing.ejs'
const mainLayout = '../views/layouts/main.ejs'
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const jwtSecret = process.env.JWT_SECRET
const Services = require('../model/service')
const SelectedServices = require('../model/selected_services')
const {generateUniqueID} = require('../middleware/helper')
const { instant_estimate } = require('./api')
const axios = require('axios');
const selected_services = require('../model/selected_services')

const domain = "http://127.0.0.1:3000"

const stripeSecretkey = process.env.STRIPE_SECRET_KEY
const stripePublickey = process.env.STRIPE_PUBLIC_KEY

const stripe = require('stripe')(stripeSecretkey);

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
    const {userId} = req

    const user = await User.findById(userId)

    const services = await Services.find({})

    let address
    if(req.session.formData){
        const storedData = req.session.formData
        address = storedData.address
        delete req.session.formData;
    }

    res.render('get-quote', {
        title: "Get A Quote",
        layout: mainLayout,
        is_user, is_admin, services,address, user
    })
}


const get_quote = async (req, res) => {

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

    //get estimated price for service
    const url = `${domain}/api/instant_estimate`;

    let price, lotsize, error_
    
    if(service == "Mowing"){
        try {
            const response = await axios.post(url, {
                address
              });
          
            //   console.log(response)
              console.log(response.data)
              price = response.data.price
              lotsize = response.data.lotsize
              error_ = response.data.stmsg
              if(response.data.statusCode == '404'){
                error_ = response.data.statusmessage
              }
             
        } catch (error) {
            console.log(error)
        }
    }
    

    let price_ = 0
    if(price)  price_ = price

    const quotes = await SelectedServices.create({
        id: unique_id,
        customer: user.fullname,
        customer_email: email,
        customer_address: address,
        customer_phone: number,
        service: service,
        date_of_service: date,
        customerId: user._id,
        price: price_
    })

    res.redirect('/dashboard/customer?success=Quote successfully sent. Wait for a response from admin')
   
}

const instantEstimate = async (req, res) => {
    const {is_user, is_admin } = await CheckAuth(req, res)

    let error
    if(req.query.error) error = req.query.error

    res.render('instant_estimate', {
        title: "Instant Estimate",
        layout: mainLayout,
        is_user, is_admin, error,

        
    })
} 


const url = `${domain}/api/instant_estimate`;

const getestimate = async (req) => {

    const {house, street, city, state, zip, address } = req.body

    let price, lotsize, error_
    try {
        const response = await axios.post(url, {
            house,
            street,
            city,
            state,
            zip,
            address
          });
      
        //   console.log(response)
          console.log(response.data)
          price = response.data.price
          lotsize = response.data.lotsize
          error_ = response.data.stmsg
          if(response.data.statusCode == '404'){
            error_ = response.data.statusmessage
          }
    } catch (error) {
        console.log(error)
        return null
    }

    return {lotsize: lotsize, price: price, error_: error_} 
}

const postInstantEstimate = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    const {house, street, city, state, zip, address } = req.body

    let price2, lotsize2, error_2
    const {lotsize, price, error_ } = await getestimate(req)
    price2 = price
    lotsize2 = lotsize
    error_2 = error_


    let trial = 0
    while(!lotsize2 && !error_2){
        const {lotsize, price, error_ } = await getestimate(req)
        lotsize2 = lotsize
        error_2 = error_
        trial = trial + 1
        console.log("trial- ", trial)
        if(trial >= 5y){
            return res.redirect('/instant-estimate?error=Check your Internet connection#est')
        }
        
    }
     
    
    req.session.formData = {price, address};

    res.render('instant_estimate2', {
        title: "Instant Estimate",
        layout: mainLayout,
        is_user, is_admin, price2, lotsize2, error_2
    })
}

const payment_page = async (req,res) => {
    const {is_user, is_admin } = await CheckAuth(req, res)
    const {userId} = req
    const user = await User.findById(userId)

    let error
    if(req.query.error) error = req.query.error

    const {id} = req.params
    const quote = await SelectedServices.findOne({id: id, customerId: user.id})
    if(!quote){
        // check if it is a membership payment
        if(id != "MeM234"){//unique ID for membership
            return res.render('404')
        }
    }

    // if paid
    let paid = false
    if(quote){
        if(quote.paid == true){
            paid = true
        }
    }

    if(id == "MeM234"){
        if(user.gp_membership == true){
            paid = true
        }
    }

    res.render('payment_page', {
        title: "Payment Page",
        layout: mainLayout,
        is_user, is_admin, error, stripePublickey, quote,
        user, id, paid
    })
}

const charge = async (req, res) => {
    const {id} = req.params
    const {userId} = req
    const user = await User.findById(userId)

    console.log(req.body)
    const {token, name, email, phone } = req.body;
    if(!email || !phone || !name){
        return res.redirect(`/payment/${id}?error=Fill all inputs`);
    }

    if(!token){
        return res.redirect(`/payment/${id}?error=Fill in the card details`);
    }

    try {

        const service = await SelectedServices.findOne({id: id, customerId: user.id})
        if(!service){
            if(id != "MeM234"){//unique ID for membership
                return res.render('404')
            }
        }

        // if paid
        let paid = false
        if(service){
            if(service.paid == true){
                return res.render('admin/error-500',{layout: noLayout, name: "Bad Request", message: "You have paid for this service", statusCode: 400})
            }
        }

        if(id == "MeM234"){
            if(user.gp_membership == true){
                return res.render('admin/error-500',{layout: noLayout, name: "Bad Request", message: "You have paid for the Grassroots Platinum Membership", statusCode: 400})
            }
        }
        
        // make payment Payment for Grassroots Platinum Membership
        if(id == "MeM234"){
            
            const charge = await stripe.charges.create({
                amount: 12500,
                currency: 'USD',
                source: token,
                description: `Payment for Grassroots Platinum Membership has been successfully made. Welcome Onboard`,
                receipt_email: email,
                metadata: {
                    name: name,
                    phone: phone
                },
            });
            if(charge.paid == true & charge.status == 'succeeded'){
                user.gp_membership = true
                user.gp_receipt_url = charge.receipt_url
                await user.save()
            } else {
                return res.redirect(`/payment/${id}?error=Payment Failed`);
            }
            res.redirect(`${charge.receipt_url}`);
        } else {// service payment
            let amount = service.price
            if(!amount){
                return res.redirect(`/payment/${id}?error=Payment cannot be made now because there has not been a price fixed for the ${service.service} service (${service.id}) `);
            }
            amount = amount * 100
            const charge = await stripe.charges.create({
                amount: amount,
                currency: 'USD',
                source: token,
                description: `Payment for ${service.service} service (#${service.id}) has been successfully made`,
                receipt_email: email,
                metadata: {
                    name: name,
                    phone: phone
                },
            });
            if(charge.paid == true & charge.status == 'succeeded'){
                service.paid = true
                service.receipt_url = charge.receipt_url
                await service.save()
            } else {
                return res.redirect(`/payment/${id}?error=Payment Failed`);
            }
            res.redirect(`${charge.receipt_url}`);
        }
    
    } catch (err) {
      console.error(err);
      res.redirect(`/payment/${id}?error=An error Occurred.`);
    }
}


const test = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    res.render('test', {
        title: "Test",
        layout: noLayout,
        is_user, is_admin
    })
}
module.exports = {
    home, membership,contact, CheckAuth,
    services, get_quote_page, get_quote, instantEstimate,
    postInstantEstimate, payment_page, charge, test
}