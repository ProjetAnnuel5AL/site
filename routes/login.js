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
			res.render('login.ejs', { msgError: "", session : req.session });
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
				res.render('login.ejs', {msgError:msgError, session : req.session});
			} else if(!req.body.password) {
				msgError = "Veuillez saisir votre mot de passe ! ";
				res.render('login.ejs', {msgError:msgError, session : req.session});
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
                        res.render("login.ejs", { msgError: "Erreur : identifiant inconnu", session: req.session });
                    }else if(body.code == 5 ){
                        res.render("login.ejs", { msgError: "Erreur : Votre compte n'a pas encore été validé. Merci de l'activer en suivant le lien que nous vous avons envoyé par mail. Si vous n'avez pas recu ce mail cliquez <b><u><a href='/resend'>ici</a></u></b>.", session: req.session });
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
                                    req.session.login = body.loginUser;
                                    req.session.type = body.typeUser;
                                    req.session.token = body.token;
                                    req.session.cart = [];
                                    res.redirect("/");
                                } else {
                                    res.render("login.ejs", { msgError: "Erreur combinaison login/mot de passe", session: req.session });
                                }
                            } else {
                                res.render("login.ejs", { msgError: "Erreur combinaison login/mot de passe", session: req.session });
                            }
                        }).catch(function (err) {
                            //console.log(err);
                            res.render("login.ejs", { msgError: "Erreur inconnu. Merci de réessayer.", session: req.session });
                        });

                    }
                }).catch(function (err) {
                    //console.log(err);
                    res.render("login.ejs", { msgError: "Erreur inconnu. Merci de réessayer.", session: req.session });
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
                    session : req.session}
                )
            }else{

                var ListeCar = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9");
                var salt = "";
                var pwd = "";
                for (var i = 0; i<10 ; i++){
                    pwd += ListeCar[Math.floor(Math.random()*ListeCar.length)];
                }
                for (var i = 0; i<50 ; i++){
                    salt += ListeCar[Math.floor(Math.random()*ListeCar.length)];
                }
                var pwdSalty = pwd + salt;

                rp({
                    url: urlApi + "/user/resetPassword",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "emailUser": req.body.mail,
                        "passwordUser": pwdSalty,
                        "saltUser" : salt
                    }
                }).then(function(body) { 
                    if(body.code == 0){
                        res.render('resetPassword.ejs', { 
                            msgError: "",
                            msgSuccess: "Un email contenant un lien pour réinitialiser votre mot de passe vous a été envoyé.",
                            session : req.session
                        });
                    }else if(body.code == 2){

                    }else if(body.code == 1){

                    }
                   
                }).catch(function (err) {
                    console.log(err)
                    res.render('resetPassword.ejs', { 
                        msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement !",
                        msgSuccess: "",
                        session : req.session
                    });
                });

                
            }
		}
	});
};