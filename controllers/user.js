const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const jwtSecret = process.env.JWT_SECRET
const mainLayout = '../views/layouts/main.ejs'

const {CheckAuth} = require('./main')

const register = async (req, res) => {
    const {is_user, is_admin } = await CheckAuth(req, res)

    const token = req.cookies.token;
    if (token) {
        return res.redirect('/')
    }

    let error_ = ''

    req.session.prevPage =req.get('referer')  || '/';

    if(req.query.error) error_ = req.query.error

    res.render('user/register', {
        title: "Register",
        error: error_,        
        is_user, is_admin,
        layout: mainLayout
    })
}



const login = async (req, res) => {

    const {is_user, is_admin } = await CheckAuth(req, res)

    const token = req.cookies.token;
    if (token) {
        return res.redirect('/')
    }
    let error_ = ''
    // Save the referer (the page the user came from) in the session
    req.session.prevPage =req.get('referer')  || '/';

    if(req.query.error) error_ = req.query.error

    res.render('user/login', {
        title: "Login",
        error: error_,
        is_user, is_admin,
        layout: mainLayout
    })
}

const logout = async (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
}
const editUser = async (req, res) => {
    const token = req.cookies.token;

    const user = await User.findById(req.userId)

    let error_ = ''
    res.render('edit-register', {layout: noLayout, error: error_,user})
}

const editUserInfo = async (req,res) => {
            
    const user_  = await User.findById(req.userId)

    try {
        const {username, email, phone_number, adress} = req.body

        let originalname_ = user_.pic_originalname
        let image_url = user_.pic_path
        if(req.files.file){
            // Access the uploaded file details
            const { originalname, buffer, mimetype } = req.files.file[0];
            originalname_ = originalname
            image_url = `data:${mimetype};base64,${buffer.toString('base64')}`;
       }
        const user = await User.findOneAndUpdate({_id: req.userId}, {
            username, email, 
            phone_number, adress,  
            pic_originalname: originalname_,
            pic_path: image_url
        }, {runValidators: true, new: true})

        if(user.admin){
            return res.redirect('/admin')
        } else {    
            return res.redirect('/user-items')
        }
    }  catch (error) {
        console.log(error)
        let error_ = "Username or Email already Exists"
        if(error.name === 'ValidationError'){
            var msg = Object.values(error.errors).map((item) => item.message).join(',')
            error_ = msg
        }
        return res.render('edit-register', {layout: noLayout, error: error_, user: user_})
    } 
}

const postRegister = async (req,res) => {

    try {
        const {name, password, email, number, address} = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            fullname: name,
            password: hashedPassword, email, 
            phone_number: number,address,
        })
        const token =  await jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
        res.cookie('token', token, {httpOnly: true})

        if(user.admin){
            const redirectUrl = req.session.referer || req.session.prevPage || '/dashboard/admin';
            return res.redirect(redirectUrl)
        } else {    
            const redirectUrl = req.session.referer || req.session.prevPage || '/dashboard/customer';
            return res.redirect(redirectUrl)
        }
    }  catch (error) {
        console.log(error)
        let error_ = "Username or Email already Exists"
        if(error.name === 'ValidationError'){
            var msg = Object.values(error.errors).map((item) => item.message).join(',')
            error_ = msg
        }
        return res.redirect(`/register?error=${error_}`)
    } 
}


const postLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await User.findOne({email})


    let error = ""
    if(!user) {
        error = "Invalid credentials"
        return res.redirect(`/login?error=${error}`)
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
        error = "Invalid credentials"
        return res.redirect(`/login?error=${error}`)
    }

    if(user.blocked == true){
        error = "You have been blocked."
        return res.redirect(`/login?error=${error}`)
    }
    
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.cookie('token', token, {httpOnly: true})

    if(user.admin){
        const redirectUrl = req.session.referer || req.session.prevPage || '/dashboard/admin';
        return res.redirect(redirectUrl)
    } else {    
        const redirectUrl = req.session.referer || req.session.prevPage || '/dashboard/customer';
        return res.redirect(redirectUrl)
    }
}

const resetPasswordPage = async (req, res) => {
    const {token} = req.query
    const {is_user, is_admin} = await allPages(req, res)

    let error = ""
    if (req.query.error){
        error = req.query.error
    }
    res.render('main/reset_password',{
        title: "Reset Password",
        description: "",
        image_url: "",
        is_user,
        is_admin, stripePublickey,
        token, error
    })
}

const forgotPasswordPage = async (req, res) => {
    const {is_user, is_admin} = await allPages(req, res)

    let success = ""
    if (req.query.success){
        success = req.query.success
    }

    let error = ""
    if (req.query.error){
        error = req.query.error
    }

    let email = ""
    if (req.query.email){
        email = req.query.email
    }
    res.render('main/forgot_password',{
        title: "Forgot Password",
        description: "",
        image_url: "",
        is_user,
        is_admin, stripePublickey,
        success, error, email
    })
}

// post 
const forgotPassword = async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})

    if(!user) {
        return res.redirect(`/forgotpassword?error=No user found with the email ${email}`)
    }

    //generate a unique reset token
    const resetToken = await generateToken(24)

    // could create a expiration time

    user.resetToken = resetToken
    await user.save()

    try{
        //send the reset email
        const resetUrl =`${url}/resetpassword?token=${resetToken}`
        const text= `Here's a link to reset your password- <a href="${resetUrl}"> ${resetUrl} </a>`
        const title = `Reset Password`
        const {transport} = await sendNotification(email, user.username, text, title)

    } catch (error) {
        console.log(error)
        return res.redirect(`/forgotpassword?error=There was an error in sending the mail, contact admin or check your internet connection`)
    }
    


    res.redirect('/forgotpassword?success=Reset link has been sent to your email')

}

// post
const resetPassword = async (req, res) => {

    const { newPassword} = req.body
    const {token} = req.query

    if( !token) {
        return res.redirect(`/resetpassword?error=No token found`)
    }
    
    const user = await User.findOne({resetToken: token})
    if (!user) {
        return res.redirect(`/resetpassword?token=${token}&error=No user found with the token ${token} Or Token has expired`)
    }

    //validate the expiration time here

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    user.resetToken = undefined
    await user.save()
    
    res.redirect('/login')

}

module.exports = {
    postRegister,
    postLogin,
    register,
    login,
    logout,
    resetPassword, forgotPassword,
    resetPasswordPage, forgotPasswordPage, editUserInfo, editUser
}