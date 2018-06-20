module.exports = function(app, urlApi, utils, config){
   
    var rp = require("request-promise");

    app.get("/proceedCheckout/address", function(req, res, next) {
        if(!req.session.cart /*|| req.session.cart.length==0*/ ) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/user/findAddress",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token
                }
            }).then(function (body) {
                var address = body;  
                res.render("proceedCheckoutAddress.ejs", {
                    session: req.session,
                    address: address,
                    msgError:"",
                    msgSuccess: ""
                });
            
            });
        }
    });

    app.post("/proceedCheckout/pay", function (req, res, next) {
        if(!req.session.cart /*|| req.session.cart.length==0*/ ) {
			res.redirect("/");
		}else{
            var address = null;
            var addressError = null;
            rp({
                url: urlApi + "/user/findAddress",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token
                }
            }).then(function (body) {
                var addressError = body;  
            }).catch(function(err){});

            
            if(req.body.addressSave == "true"){
                address = addressError;
            }else{
                if(!req.body.lastName) {
                    res.render("proceedCheckoutAddress.ejs", {
                        session: req.session,
                        address: addressError,
                        msgError:"Veuillez saisir un nom !",
                        msgSuccess: ""
                    });  
                }else if(!req.body.firstName) {
                    res.render("proceedCheckoutAddress.ejs", {
                        session: req.session,
                        address: addressError,
                        msgError:"Veuillez saisir un prenom !",
                        msgSuccess: ""
                    });
                }else if(!req.body.sex) {
                    res.render("proceedCheckoutAddress.ejs", {
                        session: req.session,
                        address: addressError,
                        msgError:"Veuillez saisir une civilité !",
                        msgSuccess: ""
                    });
                }else if(!req.body.address) {
                    res.render("proceedCheckoutAddress.ejs", {
                        session: req.session,
                        address: addressError,
                        msgError:"Veuillez saisir une adresse !",
                        msgSuccess: ""
                    });
                }else if(!req.body.city) {
                    res.render("proceedCheckoutAddress.ejs", {
                        session: req.session,
                        address: addressError,
                        msgError:"Veuillez saisir une ville !",
                        msgSuccess: ""
                    });
                }else if(!req.body.cp) {
                    res.render("proceedCheckoutAddress.ejs", {
                        session: req.session,
                        address: addressError,
                        msgError:"Veuillez saisir un code postal !",
                        msgSuccess: ""
                    });
                
                }else{
                    address = {
                        "lastNameUser" : req.body.lastName,
                        "firstNameUser" : req.body.firstName,
                        "sexUser" : req.body.sex,
                        "addressUser" : req.body.address,
                        "cityUser" :req.body.city,
                        "cpUser" : req.body.cp,
                    }
                }
            }

            if(address != null && address.lastNameUser != null && address.lastNameUser != ""){
                // On commence par vérifier que tous les produits sont toujours disponible pour la quantité commandé.
                res.render("proceedCheckoutPay.ejs", {
                    session: req.session,
                    address: address,
                    paypalClientId : config.paypalClientId,
                    paypalMode: config.paypalMode,
                    msgError:"",
                    msgSuccess: ""
                });
            }else{
                res.render("proceedCheckoutAddress.ejs", {
                    session: req.session,
                    address: addressError,
                    msgError:"Une erreur s'est produite lors de la récupération de votre adresse de livraison. Merci de réessayer ultérieurement.",
                    msgSuccess: ""
                });
            }
        }
    });

    //Obliger de passer par un appel via la express pour le 'Access-control-allow-origin'
    app.get("/proceedCheckout/verifyQuantity/:id", function (req, res, next) {
        console.log(req.params);
        if(req.params.id){
            rp({
                url: urlApi + "/item/verifyQuantity/"+req.params.id,
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(function (body) {
                res.json(body);
            }).catch(function(err){
                res.json({
                    "code" : 1,
                    "message" : "Error rp"
                })
            });
        }else{
            res.json({
                "code" : 1,
                "message" : "Missing required parameters"
            })
        }
    });
}