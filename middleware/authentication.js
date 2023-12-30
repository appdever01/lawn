const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const User = require('../model/user')
const noLayout = '../views/layouts/nothing.ejs'


const authMiddleware = async (req, res, next ) => {
  try {
    
    req.session.referer = req.originalUrl
    const token = req.cookies.token;
  
    if(!token) {
      return res.redirect('/login')
    }
  
    
    const decoded = jwt.verify(token, jwtSecret);
    //dont just find by Id, but by password
    const user = await User.findById(decoded.userId)
    if(!user) {
      return redirect('/login')
    }
    req.userId = decoded.userId;
    next();
  } catch(error) {
    console.log(error)
    req.session.referer = req.originalUrl
    if(error instanceof jwt.JsonWebTokenError){
      res.clearCookie('token');
      return res.redirect('/login')
    }
    return res.redirect('/login')
  }

  }


  

const auth = async (req, res ) => {
  try {
    const token = req.cookies.token;
  
    if(!token) {
      return null
    }
  
    
    const decoded = jwt.verify(token, jwtSecret);
    //dont just find by Id, but by password
    const user = await User.findById(decoded.userId)
    if(!user) {
      return null
    }
    req.userId = decoded.userId;
    return req.userId
  } catch(error) {
    return null
  }

  }

// Check if they are admin and if so grant them access
const authAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId)
  if(!user) {
    return res.render("admin/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "No User Found"})
  }

  let check_admin = user.admin
  if(check_admin == true) {
    next()
  } else {
    return res.render("admin/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "You are not allowed to access this page, contact ADMIN "})
  }
}

const notAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId)
  if(!user) {
    return res.render("admin/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "No User Found"})
  }

  let check_admin = user.admin
  if(check_admin == false) {
    next()
  } else {
    return res.render("admin/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "Admin is not allowed to perform this action"})
  }
}

module.exports = {
    authMiddleware,
    authAdmin,
    notAdmin,
    auth,
}