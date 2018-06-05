module.exports = function(app, urlApi, urlLocal, utils){

    var rp = require("request-promise");
    var bcrypt = require("bcrypt-nodejs");

    app.get("/profil", function(req, res, next) {
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
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"",
                    msgSuccess: ""
                });
            
            });
        }
    });


    app.post("/generalInformation", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            var profil = getLocalProfil(req);
            if(!req.body.mail) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir un mail !",
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
                        "emailUser": req.body.mail,
                        "token": req.session.token
                    }
                }).then(function(body) {    
                    if(body.code ==0){
                        profil.emailUser =  req.body.mail;
                        res.render("profil.ejs", {
                            session: req.session,
                            profil: profil,
                            msgError:"",
                            msgSuccess: "Modification effectuée !"
                           
                        });
                    }else{
                        
                        res.render("profil.ejs", {
                            session: req.session,
                            profil: profil,
                            msgError:"Erreur lors de la modification, veuillez recommmencer",
                            msgSuccess: ""
                           
                        });
                      
                    }
                }).catch(function (err) {
                    //console.log(err);

                    res.render("profil.ejs", {
                        session: req.session,
                        profil: profil,
                        msgError:"Erreur lors de la modification, veuillez recommmencer",
                        msgSuccess: ""
                    });
                });

            }
           
            
        }
    });



    
    app.post("/updatePassword", function (req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
           var profil = getLocalProfil(req);

            if(!req.body.password) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir un mot de passe !", msgSuccess: "",
                });
            }else if(!req.body.passwordConfirm) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez retaper votre mot de passe",
                    msgSuccess: ""
                });
            } else if(req.body.password != req.body.passwordConfirm){
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Les mots de passe saisient ne sont pas identiques !",
                    msgSuccess: ""
                });
            } else if(req.body.password.length<8 || req.body.password.search("[A-Z]+")== -1 || req.body.password.search("[a-z]+")== -1 || req.body.password.search("[0-9]+")== -1 || req.body.password.search("[^ \w]+")== -1) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Mot de passe invalide : 8 caractères minimum, au moins une majuscule et une minuscule, un chiffre et un caractère spéciale sont requis ! ",
                    msgSuccess: ""
                });
            }else {
                //on vérifie que l'ancien mdp est bon
                rp({
                    url: urlApi + "/user/auth",
                    method: "GET",
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
                        
                        var ListeCar = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9");
                        var salt = "";
                        for (var i = 0; i<50 ; i++){
                            salt += ListeCar[Math.floor(Math.random()*ListeCar.length)];
                        }
        
                        var pwdSalty = req.body.password + salt;

                        rp({
                            url: urlApi + "/user/update",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            json: {
                                "loginUser" : req.session.login,
                                "passwordUser" : bcrypt.hashSync(pwdSalty, null, null),
                                "saltUser" : salt,
                                "token": req.session.token
                            }
                        }).then(function(body) {    
                            if(body.code ==0){
                                profil.emailUser =  req.body.mail;
                                res.render("profil.ejs", {
                                    session: req.session,
                                    profil: profil,
                                    msgError:"",
                                    msgSuccess: "Changement du mot de passe effectuée !"
                                   
                                });
                            }else{
                                
                                res.render("profil.ejs", {
                                    session: req.session,
                                    profil: profil,
                                    msgError:"Erreur lors de la modification du mot de passe, veuillez recommmencer",
                                    msgSuccess: ""
                                   
                                });
                              
                            }
                        }).catch(function (err) {
                            //console.log(err);
        
                            res.render("profil.ejs", {
                                session: req.session,
                                profil: profil,
                                msgError:"Erreur lors de la modification, veuillez recommmencer",
                                msgSuccess: ""
                            });
                        });
                        


                    } else {
                        res.render("profil.ejs", {
                            session: req.session,
                            profil: profil,
                            msgError:"Ancien mot de passe invalid ",
                            msgSuccess: ""
                        });
                    }
                    
                }).catch(function (err) {
                    //console.log(err);
                    res.render("profil.ejs", {
                        session: req.session,
                        profil: profil,
                        msgError:"Erreur lors de la modification du mot de passe. Veuillez recommmencer ",
                        msgSuccess: ""
                    });
                });


            } 

        }
    });

    app.post("/informationsLivraison", function (req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else{
            var profil = getLocalProfil(req);
            
            if(!req.body.lastName) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir un nom !",
                    msgSuccess: ""
                });
            }else if(!req.body.firstName) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir un prénom !",
                    msgSuccess: ""
                });
            }else if(!req.body.birth) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir une date de naissance !",
                    msgSuccess: ""
                });
            }else if(!req.body.sex) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir un sexe !",
                    msgSuccess: ""
                });
            }else if(!req.body.address) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir une adresse !",
                    msgSuccess: ""
                });
            }else if(!req.body.city) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
                    msgError:"Veuillez saisir une ville !",
                    msgSuccess: ""
                });
            }
            else if(!req.body.cp) {
                res.render("profil.ejs", {
                    session: req.session,
                    profil: profil,
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
                        "birthUser": req.body.birth,
                        "sexUser": req.body.sex,
                        "addressUser": req.body.address,
                        "cityUser": req.body.city,
                        "cpUser": req.body.cp,
                        "token": req.session.token
                    }
                }).then(function(body) {    
                    if(body.code ==0){

                        profil.firstNameUser = req.body.lastName;
                        profil.lastNameUser = req.body.firstName;
                        profil.birthUser = req.body.birth;
                        profil.sexUser = req.body.sex;
                        profil.addressUser = req.body.address;
                        profil.cityUser = req.body.city;
                        profil.cpUser = req.body.cp;

                        res.render("profil.ejs", {
                            session: req.session,
                            profil: profil,
                            msgError:"",
                            msgSuccess: "Modification des informations de livraison effectuée !"
                           
                        });
                    }else{
                        
                        res.render("profil.ejs", {
                            session: req.session,
                            profil: profil,
                            msgError:"Erreur lors de la modification, veuillez recommmencer",
                            msgSuccess: ""
                           
                        });
                      
                    }
                }).catch(function (err) {
                    //console.log(err);

                    res.render("profil.ejs", {
                        session: req.session,
                        profil: profil,
                        msgError:"Erreur lors de la modification, veuillez recommmencer",
                        msgSuccess: ""
                    });
                });

            }


        }
    });


    function getLocalProfil(req){
        var profil = {
            emailUser : req.body.profilMail,
            loginUser : req.session.login,
            firstNameUser : req.body.profilFirstName,
            lastNameUser : req.body.profilLastName,
            birthUser : req.body.profilBirth,
            sexUser : req.body.profilSex,
            addressUser : req.body.profilAddress,
            cityUser : req.body.profilCity,
            cpUser : req.body.profilCp
        };
        return profil;
    }
    
};