module.exports = function(app, urlApi,urlLocal,  utils){
   
    var rp = require("request-promise");

    app.get("/proceedCheckout/address", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/user/findByLogin",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                }
            }).then(function (body) {
                var profil = body;  
                res.render("proceedCheckoutAddress.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"",
                    msgSuccess: ""
                });
            
            });
        }
    });


}