/**
 * Created by iPlowPlow on 03/05/2017.
 */

 // Test1234(
module.exports = function(app, urlApi,urlLocal,  utils){

    var rp = require("request-promise");
    var bcrypt = require("bcrypt-nodejs");
    
    // =====================================
    // inscription ==============================
    // =====================================
    // show the inscription form
    app.get("/registration", function(req, res, next) {
        if(req.session.type && req.session.type != ""){
            res.redirect("/");
        }else {
            res.render("registration.ejs", {msgError: "", msgSuccess: "", session: req.session});
        }
    });

    // process the inscription form
    app.post("/registration", function (req, res, next) {
        if(req.session.type && req.session.type != ""){
            res.redirect("/");
        } else {
            if (!req.body.username){
                res.render("registration.ejs", {
                    msgError:"Veuillez saisir un login !",
                    msgSuccess: "",
                    session : req.session
                });
            } else if(!req.body.password) {
                res.render("registration.ejs", {
                    msgError:"Veuillez saisir un mot de passe !", msgSuccess: "",
                    session : req.session
                });
            } else if(!req.body.mail) {
                res.render("registration.ejs", {
                    msgError:"Veuillez saisir un mail !",
                    msgSuccess: "",
                    session : req.session
                });
            } else if(!req.body.passwordConfirm) {
                res.render("registration.ejs", {
                    msgError:"Veuillez retaper votre mot de passe",
                    msgSuccess: "",
                    session : req.session
                });
            } else if(req.body.password != req.body.passwordConfirm){
                res.render("registration.ejs", {
                    msgError:"Les mots de passe saisient ne sont pas identiques !",
                    msgSuccess: "",
                    session : req.session
                });
            } else if(req.body.password.length<8 || req.body.password.search("[A-Z]+")== -1 || req.body.password.search("[a-z]+")== -1 || req.body.password.search("[0-9]+")== -1 || req.body.password.search(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\'\"\&]/g) == -1) {
               res.render("registration.ejs", {
                    msgError:"Mot de passe invalide : 8 caractères minimum, au moins une majuscule et une minuscule, un chiffre et un caractère spéciale ( parmis les suivants : &\"'(-_)=+?.^$ ) sont requis ! ",
                    msgSuccess: "",
                    session : req.session
                });
            }else {
               
                //On génere le Salt
                var ListeCar = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9");
                var salt = "";
                var validationCodeUser ="";
                for (var i = 0; i<50 ; i++){
                    salt += ListeCar[Math.floor(Math.random()*ListeCar.length)];
                    validationCodeUser += ListeCar[Math.floor(Math.random()*ListeCar.length)];
                }

                var pwdSalty = req.body.password + salt;

                rp({
                    url: urlApi + "/user" ,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.body.username,
                        "passwordUser" : bcrypt.hashSync(pwdSalty, null, null),
                        "saltUser" : salt,
                        "emailUser": req.body.mail,
                        "validationCodeUser" : validationCodeUser
                    }
                }).then(function(body){
                    if(body.code == 0){
                        var ServiceMail = utils.ServiceMail;
                        var myMail = new ServiceMail();
                        myMail.sendMail(req.body.mail,"Validation Inscription", "Votre inscription à bien été prise en compte. Afin de valider votre inscription merci de suivre le lien suivant : " +urlLocal+"/registrationValidation/" +validationCodeUser);
                        res.render("registration.ejs", {
                            msgError:"",
                            msgSuccess: "Inscription validée ! Merci de consulter votre boite mail pour valider votre inscrption. Cela peut prendre plusieurs minutes",
                            session : req.session
                        });
                    }else if(body.code == 4){
                        res.render("registration.ejs", {
                            msgError: "Ce nom d'utilistateur n'est pas disponible.",
                            msgSuccess: "",
                            session : req.session
                        });
                    }else if(body.code == 5){
                        res.render("registration.ejs", {
                            msgError: "Cette adresse email n'est pas disponible.",
                            msgSuccess: "",
                            session : req.session
                        });
                    }else{
                        res.render("registration.ejs", {
                            msgError: "Erreur lors de l'inscription. Veuillez recommmencer !",
                            msgSuccess: "",
                            session : req.session
                        });
                    }
                   
                }).catch(function (err) {
                    //console.log(err);
                    res.render("registration.ejs", {
                        msgError: "Erreur lors de l'inscription. Veuillez recommmencer !",
                        msgSuccess: "",
                        session : req.session
                    });
                });
                    
               
                
            }
                
            
        }
    });

};
