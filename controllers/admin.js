const adminLayout = '../views/layouts/admin.ejs'
const User = require('../model/user')
const SelectedServices = require('../model/selected_services')
const Services = require('../model/service')



const admin_dashboard = async (req, res) => {

    const {userId} = req

    const user = await User.findById(userId)

    const allUsers = await User.find({})
    const no_customers = await User.find({}).count()
    const no_members = await User.find({gp_membership: true}).count()

    const selected_services = await SelectedServices.find({})
    let error, success = ""

    if(req.query.error) error = req.query.error
    if(req.query.success) success = req.query.success

    // quotes received
    const quote_no = await SelectedServices.find({}).count()
    res.render('admin/dashboard', {
        layout: adminLayout,
        allUsers,user,
        selected_services,
        error, success, quote_no,
        no_customers, no_members
    })
}

const customer_dashboard = async (req, res) => {
    const {userId} = req

    const user = await User.findById(userId)
    const selected_services = await SelectedServices.find({customerId: userId})

    let error, success = ""

    if(req.query.error) error = req.query.error
    if(req.query.success) success = req.query.success

    
    res.render('admin/customer-dashboard', {
        layout: adminLayout,
        user, error, success,
        selected_services
    })
}

const single_quote = async (req, res) => {
    const {userId} = req

    const user = await User.findById(userId)

    res.render('admin/service', {
        layout: adminLayout,
        user
    })
}

const add_service_page = async (req, res) => {
    const {userId} = req

    const user = await User.findById(userId)

    let error, bio, name = ""
    if(req.query.error) error = req.query.error
    if(req.query.name) name = req.query.name
    if(req.query.bio) bio = req.query.bio

    res.render('admin/add-service', {
        layout: adminLayout,
        error, bio, name ,
        user
    })
}

const add_service = async (req, res) => {
    const {name, bio} = req.body

    try{

        // if(!req.file){
        //     let error_ = "Error: No File Uploaded"
        //     return res.redirect(`/dashboard/add-service?error=${error_}&bio=${bio}&name=${name}`)
        // }

        // Access the uploaded file
      
        let  originalname_, image_url
        if(req.file){
            const { originalname, buffer, mimetype } = req.file;
            originalname_ = originalname
            image_url = `data:${mimetype};base64,${buffer.toString('base64')}`;
        }

        const service = await Services.create({
            service: name,
            bio, pic_originalname: originalname_,
            pic_path: image_url
        })   

        res.redirect(`/dashboard/admin?success=${name} service Successfully added`)
    } catch (error) {
        console.log(error)
        let error_ = "Error Adding a Service. Fill in the details correctly."
        if(error.name === 'ValidationError'){
            var msg = Object.values(error.errors).map((item) => item.message).join(',')
            error_= msg
        }
        return res.redirect(`/dashboard/add-service?error=${error_}&bio=${bio}&name=${name}`)
    }
    
}


const set_price_page = async (req, res) => {

    const {userId} = req

    const user = await User.findById(userId)

    const {id} = req.params

    const selected_service = await SelectedServices.findOne({_id: id})

    let error, price = ""
    if(req.query.error) error = req.query.error
    if(req.query.price) price = req.query.price

    res.render('admin/set-price', {
        layout: adminLayout,
        error, price, selected_service,
        user
    })
}

const set_price = async (req, res) => {
    
    const {id} = req.params
    const selected_service = await SelectedServices.findOne({_id: id})
    var {price} = req.body

    if(price < 0) price = price * -1

    const update_quote = await SelectedServices.findOneAndUpdate({_id: id}, {price: price}, {runValidators: true, new: true})

    res.redirect(`/dashboard/admin?success=Price successfully updated for Quote_id: ${selected_service.id}`)
}


module.exports ={
    admin_dashboard, customer_dashboard, 
    single_quote, add_service_page,
    add_service, set_price, set_price_page
}