module.exports = function(app, urlApi, utils){

    var msgError = "";
	var bcrypt = require("bcrypt-nodejs");
	var rp = require("request-promise");
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		if(req.session.type && req.session.type != "") {
			res.redirect("/");
		}else{
			res.render('login.ejs', { msgError: "", session : req.session });
		}
	});

	// process the login form
	app.post('/login', function (req, res, next) {
		if(req.session.type && req.session.type != "") {
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
                        res.render("login.ejs", { msgError: "Erreur : Votre compte n'a pas encore été validé. Merci de l'activer en suivant le lien que nous vous avons envoyé par mail.", session: req.session });
                    }else{
                        rp({
                            url: urlApi + "/user/auth",
                            method: "GET",
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
};