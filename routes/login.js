module.exports = function(app, urlApi, urlLocal, utils){

    var msgError = "";
	var bcrypt = require("bcrypt-nodejs");
	var rp = require("request-promise");
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		if(req.session.type) {
			res.redirect("/");
		}else{
			res.render('login.ejs', { msgError: "", session : req.session,  msgSuccess: "" });
		}
	});

	// process the login form
	app.post('/login', function (req, res, next) {
		if(req.session.type) {
			res.redirect("/");
		}else{
			msgError="";
			if(!req.body.login){
				msgError = "Veuillez saisir votre identifiant ! ";
				res.render('login.ejs', {msgError:msgError, session : req.session, msgSuccess: ""});
			} else if(!req.body.password) {
				msgError = "Veuillez saisir votre mot de passe ! ";
				res.render('login.ejs', {msgError:msgError, session : req.session, msgSuccess: ""});
			} else {

                //Vérification de l'existance du compte + récupèration du Salt 
                rp({
                    url: urlApi + "/user/checkValidate",
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.body.login,
                        
                    }
                }).then(function (body) {
                
                    if(body.code == 3){
                        res.render("login.ejs", { msgError: "Erreur : identifiant inconnu", session: req.session, msgSuccess: "" });
                    }else if(body.code == 5 ){
                        res.render("login.ejs", { msgError: "Erreur : Votre compte n'a pas encore été validé. Merci de l'activer en suivant le lien que nous vous avons envoyé par mail. Si vous n'avez pas recu ce mail cliquez <b><u><a href='/resend'>ici</a></u></b>.", session: req.session, msgSuccess: "" });
                    }else{
                        rp({
                            url: urlApi + "/user/auth",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            json: {
                                "loginUser": req.body.login,
                                "passwordUser": req.body.password
                            }
                        }).then(function (body) {
                            if (body) {
                                if (body.code == "0") {
                                    req.session.cookie.maxAge = 1000 * 60 * 60 * 24;
                                    req.session.login = body.result.loginUser;
                                    req.session.type = body.result.typeUser;
                                    req.session.token = body.result.token;
                                    req.session.cart = [];
                                    //Pour verifier le compte paypal des agriculteurs 
                                    req.session.verifPaypalValidity = {};
                                    res.redirect("/");
                                } else {
                                    res.render("login.ejs", { msgError: "Erreur combinaison login/mot de passe", session: req.session, msgSuccess: "" });
                                }
                            } else {
                                res.render("login.ejs", { msgError: "Erreur combinaison login/mot de passe", session: req.session, msgSuccess: "" });
                            }
                        }).catch(function (err) {
                            res.render("login.ejs", { msgError: "Erreur inconnu. Merci de réessayer.", session: req.session, msgSuccess: "" });
                        });
                    }
                }).catch(function (err) {
                    res.render("login.ejs", { msgError: "Erreur inconnu. Merci de réessayer.", session: req.session, msgSuccess: "" });
                });
                
			}
		}
    });

    app.get('/login/resetPassword', function(req, res) {
		if(req.session.type) {
			res.redirect("/");
		}else{
			res.render('resetPassword.ejs', { 
                msgError: "",
                msgSuccess: "",
                session : req.session
            });
		}
    });
    
    app.post('/login/resetPassword', function(req, res) {
		if(req.session.type) {
			res.redirect("/");
		}else{
            if(!req.body.mail) {
                res.render("resetPassword.ejs",{ 
                    msgError: "Veuillez saisir un email !",
                    msgSuccess: "",
                    session : req.session
                })
            }else{
                rp({
                    url: urlApi + "/user/resetPassword",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "emailUser": req.body.mail
                    }
                }).then(function(body) { 
                    if(body.code == 0){
                        res.render('resetPassword.ejs', { 
                            msgError: "",
                            msgSuccess: "Un email contenant un lien pour réinitialiser votre mot de passe vous a été envoyé.",
                            session : req.session
                        });
                    }else if(body.code == 5){
                        res.render('resetPassword.ejs', { 
                            msgError: "Cet email n'existe pas.",
                            msgSuccess: "",
                            session : req.session
                        });
                    }else if(body.code == 2){
                        res.render('resetPassword.ejs', {   
                            msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement !",
                            msgSuccess: "",
                            session : req.session
                        });
                    }else if(body.code == 1){
                        res.render('resetPassword.ejs', { 
                            msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement !",
                            msgSuccess: "",
                            session : req.session
                        });
                    }else{
                        res.render('resetPassword.ejs', { 
                            msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement !",
                            msgSuccess: "",
                            session : req.session
                        });
                    }
                }).catch(function (err) {
                    res.render('resetPassword.ejs', { 
                        msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement !",
                        msgSuccess: "",
                        session : req.session
                    });
                });

                
            }
		}
    });
    
    app.get("/login/resetPassword/:code", function(req, res) {
        if(req.session.type) {
			res.redirect("/");
		}else{
            var code = req.params.code;
            rp({
                url: urlApi + "/user/findForResetPassword",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "codeResetPasswordUser": code
                }
            }).then(function(body) {
                if(body.code == 0){
                    res.render("resetPasswordForm.ejs", {
                        msgError: "",
                        msgSuccess: "",
                        code: code,
                        session : req.session
                    });
                }else{
                    res.redirect("/");
                }
            }).catch(function (err) {
                res.redirect("/");
            });
        }
    });


    app.post("/login/resetPassword/:code", function(req, res) {
        if(req.session.type) {
			res.redirect("/");
		}else{
            var code = req.params.code;
            if(!req.body.password) {
                res.render("resetPasswordForm.ejs", {
                    session: req.session,
                    code: code,
                    msgError:"Veuillez saisir un mot de passe !", 
                    msgSuccess: "",
                });
            }else if(!req.body.passwordConfirm) {
                res.render("resetPasswordForm.ejs", {
                    session: req.session,
                    code: code,
                    msgError:"Veuillez retaper votre mot de passe",
                    msgSuccess: ""
                });
            } else if(req.body.password != req.body.passwordConfirm){
                res.render("resetPasswordForm.ejs", {
                    session: req.session,
                    code: code,
                    msgError:"Les mots de passe saisient ne sont pas identiques !",
                    msgSuccess: ""
                });
            } else if(req.body.password.length<8 || req.body.password.search("[A-Z]+")== -1 || req.body.password.search("[a-z]+")== -1 || req.body.password.search("[0-9]+")== -1 || req.body.password.search(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\'\"\&]/g)== -1) {
                res.render("resetPasswordForm.ejs", {
                    session: req.session,
                    code: code,
                    msgError:"Mot de passe invalide : 8 caractères minimum, au moins une majuscule et une minuscule, un chiffre et un caractère spéciale sont requis ! ",
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
                        "passwordUser" : req.body.password,
                        "code": code
                    }
                }).then(function(body) {    
                    if(body.code ==0){
                        res.render('login.ejs', {msgError:msgError, session : req.session, msgSuccess: "Changement du mot de passe effectué !"});
                    }else{
                        res.render("resetPasswordForm.ejs", {
                            session: req.session,
                            code: code,
                            msgError:"Erreur lors de la modification du mot de passe, veuillez recommmencer",
                            msgSuccess: "" 
                        });                 
                    }
                }).catch(function (err) {
                    //console.log(err);
                    res.render("resetPasswordForm.ejs", {
                        session: req.session,
                        code: code,
                        msgError:"Erreur lors de la modification, veuillez recommmencer",
                        msgSuccess: ""
                    });
                });
            }
        }
    });


};