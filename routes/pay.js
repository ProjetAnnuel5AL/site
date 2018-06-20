var rp = require("request-promise");

module.exports = function(app, urlApi,urlLocal,  utils){

    app.get("/testPay", function(req, res) {

        res.render("pay.ejs", {
            session: req.session,
            msgError:"",
            msgSuccess: ""
        });
     
    })

    app.get("/validatePay", function(req, res) {
    
        console.log(req);

        res.json({message:"in validate"})
    })

    app.get("/cancelPay", function(req, res) {
    
        console.log(req);

        res.json({message:"in cancel"})
    })
}


