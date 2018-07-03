module.exports = function(app, urlApi, utils, config){
   
    var rp = require("request-promise");

    app.get("/proceedCheckout/address", function(req, res, next) {
        if(!req.session.cart || req.session.cart.length==0 ) {
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
                var address = body.result;  
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
        if(!req.session.cart || req.session.cart.length==0 ) {
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
                addressError = body.result;  
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
    app.get("/proceedCheckout/verifyQuantity/:id/:quantity", function (req, res, next) {
        var jsonResult = {};
        if(req.params.id){
            rp({
                url: urlApi + "/item/verifyQuantity/"+req.params.id,
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(function(body){
               
                if(JSON.parse(body).code == 0){
                    //mise a jour du stock instantanément
                    rp({
                        url: urlApi + "/item/updateQuantity",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        json:{
                            "quantity" : req.params.quantity,
                            "id" : req.params.id,
                            "loginUser": req.session.login,
                            "token" : req.session.token,
                        }
                    }).then(function(result){
                        //console.log(result);
                    })
                }
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

    app.post("/proceedCheckout/validate", function(req, res, next){
        if(req.session.type && req.session.cart && req.session.cart.length>0 && req.body.payementDetail && req.body.address){
            rp({
                url: urlApi + "/order",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "cart" : req.session.cart,
                    "payementDetail" : req.body.payementDetail,
                    "address" :req.body.address
                }
            }).then(function (result) {
                if(result.code == 0){
                    req.session.cart = []
                    res.render("proceedCheckoutValidate.ejs", {
                        session: req.session,
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    //console.log(result)
                    //si code pas = 0 c qu'on a un petit malin donc on bloque
                    res.redirect("/")
                }
               
            });
        }else{
            res.redirect("/");
        }
    })
}