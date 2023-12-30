const noLayout = '../views/layouts/nothing.ejs'

const notFound = async (req, res) =>  {

    return res.render("404", {
        title: "404 Error",
        description: "",
        image_url: "",
    }) 
}

module.exports = notFound
