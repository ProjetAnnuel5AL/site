
module.exports = function(app, urlApi,urlLocal,  utils){
    // =====================================
    // VALIDATION INSCRIPTION PAGE (with login links) ========
    // =====================================
    var rp = require("request-promise");

    app.get("/registrationValidation/:code", function(req, res) {
        var code = req.params.code;
        rp({
            url: urlApi + "/user/findForValidation",
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            json: {
                "validationCodeUser": code
            }
        }).then(function(body) {
            if(body.code ==0){
                res.render("registrationValidation.ejs", {
                    msgError: "",
                    msgSuccess: "Inscription validé avec succès ! vous pouvez désormais vous connecter",
                    session : req.session
                });
            }else{
                //le.log(body);
                res.render("registrationValidation.ejs", {
                    msgError: "Erreur : lien de validation non valide.",
                    msgSuccess: "",
                    session : req.session
                });
            }
        }).catch(function (err) {
            //le.log(err);
            res.render("registrationValidation.ejs", {
                msgError: "Erreur lors de la validation. Veuillez recommmencer ultérieurement !",
                msgSuccess: "",
                session : req.session
            });
        });

    });

    app.get("/resend", function(req, res) {
        if(req.session.type){
            res.redirect("/");
        }else{
            res.render("resend.ejs",{ 
                msgError: "",
                msgSuccess: "",
                session : req.session}
            )
        }
    });

    app.post("/resend", function(req, res) {
        if(req.session.type){
            res.redirect("/");
        }else{
            if (!req.body.login){
                res.render("resend.ejs",{ 
                    msgError: "Veuillez saisir un identiifant !",
                    msgSuccess: "",
                    session : req.session}
                )
            } else if(!req.body.mail) {
                res.render("resend.ejs",{ 
                    msgError: "Veuillez saisir un email !",
                    msgSuccess: "",
                    session : req.session}
                )
            }else{
                rp({
                    url: urlApi + "/user/resend",
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.body.login,
                        "emailUser" : req.body.mail
                    }
                }).then(function(body) {
                    if(body.code == 0){

                        var ServiceMail = utils.ServiceMail;
                        var myMail = new ServiceMail();
                        myMail.sendMail(req.body.mail,"Validation Inscription", "Votre inscription à bien été prise en compte. Afin de valider votre inscription merci de suivre le lien suivant : " +urlLocal+"/registrationValidation/" +body.validationCodeUser);

                        res.render("resend.ejs",{ 
                            msgError: "",
                            msgSuccess: "Un email a été renvoyé avec succès",
                            session : req.session}
                        )
                    }else if(body.code == 1){
                        res.render("resend.ejs",{ 
                            msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement!",
                            msgSuccess: "",
                            session : req.session}
                        )
                    }else if(body.code == 2){
                        res.render("resend.ejs",{ 
                            msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement!",
                            msgSuccess: "",
                            session : req.session}
                        )
                    }else if(body.code == 3){
                        res.render("resend.ejs",{ 
                            msgError: "L'utilisateur saisi n'existe pas !",
                            msgSuccess: "",
                            session : req.session}
                        )
                    }else if(body.code == 4){
                        res.render("resend.ejs",{ 
                            msgError: "Cet email est déjà utilisé !",
                            msgSuccess: "",
                            session : req.session}
                        )
                    } else if(body.code == 5){
                        res.render("resend.ejs",{ 
                            msgError: "Ce compte est déjà validé !",
                            msgSuccess: "",
                            session : req.session}
                        )
                    }else{
                        res.render("resend.ejs",{ 
                            msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement!",
                            msgSuccess: "",
                            session : req.session}
                        )
                    }
                }).catch(function (err) {
                    res.render("resend.ejs",{ 
                        msgError: "Erreur lors de la demande. Veuillez recommmencer ultérieurement!",
                        msgSuccess: "",
                        session : req.session}
                    )
                });
            }
            
        }
    });

};
