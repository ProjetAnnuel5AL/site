module.exports = function(app, urlApi, urlLocal, utils){

    var rp = require("request-promise");
    var bcrypt = require("bcrypt-nodejs");
    var fs = require("fs");
    var http = require('http');

    app.get("/userDashboard/profil", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/user/findEmail",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token
                }
            }).then(function (body) {
                if(body.code == 0){
                    var emailUser = body.result.emailUser;  
                    res.render("userDashboardProfil.ejs", {
                        session: req.session,
                        emailUser: emailUser,
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    res.redirect("/");
                }
            });
        }
    });

    app.post("/userDashboard/profil", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            var emailUser ="";
            rp({
                url: urlApi + "/user/findEmail",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token
                }
            }).then(function (body) {
                if(body.code == 0){
                    emailUser = body.result.emailUser;  
                    if(emailUser == req.body.mailNew || emailUser == req.body.mailNewConfirm){
                        res.render("userDashboardProfil.ejs", {
                            session: req.session,
                            emailUser: emailUser,
                            msgError:"Veuillez saisir une adresse mail différente de celle enregistrée actuellement !",
                            msgSuccess: ""
                        });
                    }else if(!req.body.mailNew) {
                        res.render("userDashboardProfil.ejs", {
                            session: req.session,
                            emailUser: emailUser,
                            msgError:"Veuillez saisir une nouvelle adresse mail !",
                            msgSuccess: ""
                        });
                    }else if(!req.body.mailNewConfirm) {
                        res.render("userDashboardProfil.ejs", {
                            session: req.session,
                            emailUser: emailUser,
                            msgError:"Veuillez valider votre nouvelle adresse mail !",
                            msgSuccess: ""
                        });
                    }else if(req.body.mailNew != req.body.mailNewConfirm) {
                        res.render("userDashboardProfil.ejs", {
                            session: req.session,
                            emailUser: emailUser,
                            msgError:"Les deux adresses mails saisi ne sont pas identiques !",
                            msgSuccess: ""
                        });
                    }else{
                        rp({
                            url: urlApi + "/user/update",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            json: {
                                "loginUser" : req.session.login,
                                "emailUser" : req.body.mailNew,
                                "token": req.session.token
                            }
                        }).then(function(body) {
                            if(body.code ==0){
                                res.render("userDashboardProfil.ejs", {
                                    session: req.session,
                                    emailUser: req.body.mailNew,
                                    msgError:"",
                                    msgSuccess: "Adresse Modifié avec succes."
                                });
                            }else{
                                res.render("userDashboardProfil.ejs", {
                                    session: req.session,
                                    emailUser: emailUser,
                                    msgError:"Erreur lors de la mise a jour de l'adresse mail. Merci de réessayer ultérieurement.",
                                    msgSuccess: ""
                                });
                            }   
                        }).catch(function(err){
                            res.render("userDashboardProfil.ejs", {
                                session: req.session,
                                emailUser: emailUser,
                                msgError:"Erreur lors de la mise a jour de l'adresse mail. Merci de réessayer ultérieurement.",
                                msgSuccess: ""
                            });
                        })
                    }
                }else{
                    res.redirect("/");
                }
            });

           
        }
    });
    
    app.get("/userDashboard/pwd", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            res.render("userDashboardPwd.ejs", {
                session: req.session,
                msgError:"",
                msgSuccess: ""
            });
        }
    });

    app.post("/userDashboard/pwd", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            if(!req.body.password) {
                res.render("userDashboardPwd.ejs", {
                    session: req.session,
                    msgError:"Veuillez saisir un mot de passe !", msgSuccess: "",
                });
            }else if(!req.body.passwordConfirm) {
                res.render("userDashboardPwd.ejs", {
                    session: req.session,
                    msgError:"Veuillez retaper votre mot de passe",
                    msgSuccess: ""
                });
            } else if(req.body.password != req.body.passwordConfirm){
                res.render("userDashboardPwd.ejs", {
                    session: req.session,
                    msgError:"Les mots de passe saisient ne sont pas identiques !",
                    msgSuccess: ""
                });
            } else if(req.body.password.length<8 || req.body.password.search("[A-Z]+")== -1 || req.body.password.search("[a-z]+")== -1 || req.body.password.search("[0-9]+")== -1 || req.body.password.search(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\'\"\&]/g) == -1) {
                res.render("userDashboardPwd.ejs", {
                    session: req.session,
                    msgError:"Mot de passe invalide : 8 caractères minimum, au moins une majuscule et une minuscule, un chiffre et un caractère spéciale ( parmis les suivants : &\"'(-_)=+?.^$ ) sont requis ! ",
                    msgSuccess: ""
                });
            }else {
                //on vérifie que l'ancien mdp est bon
                rp({
                    url: urlApi + "/user/auth",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "passwordUser": req.body.oldPassword
                    }
                }).then(function (body) {
                    if (body.code == "0") {
                        //Tout est ok on update
                        rp({
                            url: urlApi + "/user/update",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            json: {
                                "loginUser" : req.session.login,
                                "passwordUser" : req.body.password,
                                "token": req.session.token
                            }
                        }).then(function(body) {    
                            if(body.code ==0){
                                res.render("userDashboardPwd.ejs", {
                                    session: req.session,
                                    msgError:"",
                                    msgSuccess: "Changement du mot de passe effectué."
                                });
                            }else{
                                res.render("userDashboardPwd.ejs", {
                                    session: req.session,
                                    msgError:"Erreur lors de la mise a jour du mot de passe. Merci de réessayer ultérieurement.",
                                    msgSuccess: "" 
                                });
                            }
                        }).catch(function (err) {
                            res.render("userDashboardPwd.ejs", {
                                session: req.session,
                                msgError:"Erreur lors de la mise a jour du mot de passe. Merci de réessayer ultérieurement.",
                                msgSuccess: ""
                            });
                        });
                    } else {
                        res.render("userDashboardPwd.ejs", {
                            session: req.session,
                            msgError:"L'ancien mot de passe saisi est incorrect.",
                            msgSuccess: ""
                        });
                    }
                }).catch(function (err) {
                    res.render("userDashboardPwd.ejs", {
                        session: req.session,
                        msgError:"Erreur lors de la mise a jour du mot de passe. Merci de réessayer ultérieurement.",
                        msgSuccess: ""
                    });
                });
            }
        }
    });

    app.get("/userDashBoard/address", function(req, res, next) {
        if(!req.session.type) {
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
                    "token": req.session.token
                }
            }).then(function (body) {
                var address = body.result;  
                res.render("userDashboardAddress.ejs", {
                    session: req.session,
                    address: address,
                    msgError:"",
                    msgSuccess: ""
                });
            
            });
        }
    });

    app.post("/userDashBoard/address", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            var address;
            rp({
                url: urlApi + "/user/findAddress",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token": req.session.token
                }
            }).then(function (body) {
                address = body.result;
                if(address.lastNameUser == null){
                    address = getTmpAddress(req);
                }
                if(!req.body.lastName) {
                    res.render("userDashboardAddress.ejs", {
                        session: req.session,
                        address: address,
                        msgError:"Veuillez saisir un nom !",
                        msgSuccess: ""
                    });
                }else if(!req.body.firstName) {
                    res.render("userDashboardAddress.ejs", {
                        session: req.session,
                        address: address,
                        msgError:"Veuillez saisir un prénom !",
                        msgSuccess: ""
                    });
                }else if(!req.body.sex) {
                    res.render("userDashboardAddress.ejs", {
                        session: req.session,
                        address: address,
                        msgError:"Veuillez saisir un sexe !",
                        msgSuccess: ""
                    });
                }else if(!req.body.address) {
                    res.render("userDashboardAddress.ejs", {
                        session: req.session,
                        address: address,
                        msgError:"Veuillez saisir une adresse !",
                        msgSuccess: ""
                    });
                }else if(!req.body.city) {
                    res.render("userDashboardAddress.ejs", {
                        session: req.session,
                        address: address,
                        msgError:"Veuillez saisir une ville !",
                        msgSuccess: ""
                    });
                }else if(!req.body.cp) {
                    res.render("userDashboardAddress.ejs", {
                        session: req.session,
                        address: address,
                        msgError:"Veuillez saisir un code postal !",
                        msgSuccess: ""
                    });
                }else{

                    rp({
                        url: urlApi + "/user/update",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        json: {
                            "loginUser" : req.session.login,
                            "lastNameUser": req.body.lastName,
                            "firstNameUser": req.body.firstName,
                            "sexUser": req.body.sex,
                            "addressUser": req.body.address,
                            "cityUser": req.body.city,
                            "cpUser": req.body.cp,
                            "token": req.session.token
                        }
                    }).then(function(body) {   
                        if(body.code == 0){
                            res.render("userDashboardAddress.ejs", {
                                session: req.session,
                                address: getTmpAddress(req),
                                msgError:"",
                                msgSuccess: "Adresse de livraison enregistrée."
                            });
                        }else{
                            res.render("userDashboardAddress.ejs", {
                                session: req.session,
                                address: address,
                                msgError:"Erreur lors de la mise a jour du mot de passe. Merci de réessayer ultérieurement.",
                                msgSuccess: ""
                               
                            });
                        }
                    }).catch(function (err) {
                        
                        res.render("userDashboardAddress.ejs", {
                            session: req.session,
                            address: address,
                            msgError:"Erreur lors de la mise a jour du mot de passe. Merci de réessayer ultérieurement.",
                            msgSuccess: ""
                        });
                    });                    
                }  
            });
        }
    });

    //permet de stocker l'adresse saisie en cas d'erreur pour pas avoir a tout retaper.
    function getTmpAddress(req){
        var address = {
            firstNameUser : req.body.firstName,
            lastNameUser : req.body.lastName,
            sexUser : req.body.sex,
            addressUser : req.body.address,
            cityUser : req.body.city,
            cpUser : req.body.cp
        };
        return address;
    }

    //TOUTES LA PARTIE ORDER A PARTIR D ICI

    app.get("/userDashBoard/orders", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/order/getOdrersFromUser",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token

                }
            }).then(function (body) {
                res.render("userDashboardOrders.ejs", {
                    session: req.session,
                    orders: body.result.orders,
                    status:  body.result.status,
                    msgError:"",
                    msgSuccess: ""
                });
            
            });
        }
    });
    
    app.get("/userDashboard/orderDetails/:id", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/order/getOrderDetailsFromuser",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "idOrder" : req.params.id

                }
            }).then(function (body) {
                if(body.code == 0){
                    res.render("userDashboardOrderDetail.ejs", {
                        session: req.session,
                        order: body.result,
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    res.render("userDashboardOrderDetail.ejs", {
                        session: req.session,
                        order: null,
                        msgError:"Erreur lors de la récupération de la commande. Merci de réessayer ultérieurement.",
                        msgSuccess: ""
                    });
                }
            });
        }
    });


    app.get("/userDashboard/orderDetails/validateReception/:idOrder/:idLigneOrder", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/order/validateReceptionFromUser",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "idOrder" : req.params.idOrder,
                    "idLigneOrder" : req.params.idLigneOrder
                }
            }).then(function (body) {
               res.redirect("/userDashboard/orderDetails/"+req.params.idOrder);
            });
        }
    });

    app.get("/userDashboard/billExport/:idProducer/:idOrder", function(req, res, next) {
        //if(!req.session.type) {
			//res.redirect("/");
		//}else{
            rp({
                url: urlApi + "/order/getBillFromUser",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "idOrder" : req.params.idOrder,
                    "idProducer" : req.params.idProducer

                }
            }).then(function (body) {
                var file = fs.createWriteStream("ressources/pdf/file.jpg");
                var request = http.get("http://localhost:8888/producerAvatar/4/avatar.jpg", function(response) {
                  response.pipe(file);
                  response.on('end', function () {
                        var fullpath = process.cwd() + "/ressources/pdf/Job-Research.pdf";
                        res.sendFile(fullpath)
                  })
                })
               
               
            });
            
        //}
    });

    
    
};