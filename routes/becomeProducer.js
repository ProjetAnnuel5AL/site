module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/becomeProducer", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else if(req.session.type =="1"){
            res.redirect("/updateProducer")
        }else{
            req.session.verifPaypalValidity = {}
            res.render("becomeProducer.ejs", {
                session: req.session,
                producer: {},
                msgError:"",
                msgSuccess: "",
                paypalClientId :config.paypalClientId,
                paypalMode : config.paypalMode
            });
        }
    });

    app.post("/becomeProducer", function(req, res, next) {
        console.log("in")
        if(!req.session.type) {
			res.redirect("/");
		}else if(req.session.type =="1"){
            res.redirect("/updateProducer")
        }else{
            var form = new formidable.IncomingForm();
            
            form.parse(req, function (err, fields, files) {
            
                var localProducer = getLocalProducer(fields);
                var extensionT = files.avatar.name.split('.');
                var extension = extensionT[extensionT.length-1];
                console.log(files)
                if(files.avatar.name !="" && ( files.avatar.size> 5242880  ||  (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" && extension != "bmp" && extension != "tif" && extension != "tiff"))){
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Le fichier utilisé pour la photo n'est pas confomre : \nExtensions acceptées :  \n\rPoid maximum : 5Mo  ",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.lastName) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un nom !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.firstName) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un prénom !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.birth) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une date de naissance !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.sex) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un sexe !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.email) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un email !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.phone) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un numéro de téléphone !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.address) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une adresse !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.city) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une ville !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.emailPaypal) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez renseigner un compte paypal valide !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.cp) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un code postal !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else if(!fields.description || fields.description.length<20 || fields.description.length>500) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une description ayant entre 20 et 500 caractères  !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode
                    });
                }else{  
                    rp({
                        url: urlApi + "/producer",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        json: {
                            "loginUser" : req.session.login,
                            "token": req.session.token,
                            "lastNameProducer": fields.lastName,
                            "firstNameProducer": fields.firstName,
                            "avatarProducer": files.avatar,
                            "emailProducer": fields.email,
                            "phoneProducer": fields.phone,
                            "birthProducer": fields.birth,
                            "sexProducer": fields.sex,
                            "addressProducer": fields.address,
                            "cityProducer": fields.city,
                            "cpProducer": fields.cp,
                            "descriptionProducer": fields.description,
                            "paypalProducer": fields.emailPaypal
                        }
                    }).then(function(body) {   
                        if(body.code == 0){
                            req.session.type=1;
                            var avatar ="";
                            if(files.avatar.name==""){
                                avatar = "../img/avatar.png";
                            }else{
                                avatar = config.urlAvatarProducer +"/"+  body.id +"/avatar.png"+ 
                            }
                            res.render("ficheProducer.ejs", {
                                session: req.session,
                                producer: localProducer,
                                avatar: avatar,
                                msgError:"",
                                msgSuccess: "Vous êtes désormais enregistré en temps que producteur ! Vous trouverez ci-dessous votre fiche personnel. Un nouvel onglet a également été ajouté pour vous permettre de gérer vos ventes."
                            });
                        }else{
                            console.log(body);
                            res.render("becomeProducer.ejs", {
                                session: req.session,
                                producer: localProducer,
                                msgError:"Erreur inconnu 2. Merci de réessayer ultérieurement.",
                                msgSuccess: "",
                                paypalClientId :config.paypalClientId,
                                paypalMode : config.paypalMode
                               
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        res.render("becomeProducer.ejs", {
                            session: req.session,
                            producer: localProducer,
                            msgError:"Erreur inconnu 1. Merci de réessayer ultérieurement.",
                            msgSuccess: "",
                            paypalClientId :config.paypalClientId,
                            paypalMode : config.paypalMode
                        });
                    });

                   
                }            
            });
        }
    });



    var paypal = require('paypal-rest-sdk');
    var openIdConnect = paypal.openIdConnect;

    //set configs for openid_client_id and openid_client_secret if they are different from your
    //usual client_id and secret. openid_redirect_uri is required
    paypal.configure({
        'mode': config.paypalMode,
        'openid_client_id': config.paypalClientId,
        'openid_client_secret': config.paypalSecret,
        'openid_redirect_uri': 'http://localhost:8082/becomeProducer/loginpaypal'
    });


    app.get("/becomeProducer/loginpaypal", function(req, res, next) {
        //obligé de faire une redirection pour save les params car on ne peut pas les sauvegarder directements dans les methodes openIdConnect.
        if(req.session.type){
            // With Authorizatiion code
            openIdConnect.tokeninfo.create(req.query.code, function (error, tokeninfo) {
                if (error) {
                    console.log(error);
                    res.render("close.ejs");
                } else {
                    openIdConnect.userinfo.get(tokeninfo.access_token, function (error, userinfo) {
                        if (error) {
                            console.log(error);
                            res.render("close.ejs");
                        } else { 
                            // userinfo.email userinfo.verified userinfo.account_type userinfo.email_verified userinfo.verified_account
                            res.redirect("/saveUserInfo/" + userinfo.email)
                        }
                    });
                    
                }
            })
        }
       
    });

    app.get("/saveUserInfo/:email", function(req, res, next) {

        req.session.verifPaypalValidity = {email : req.params.email}

        res.render("close.ejs");
    })

    //GET ALL USER
    app.get("/becomeProducer/verifyPaypalAccount", function(req, res, next) {

        if(req.session.type){
            if(req.session.verifPaypalValidity.email){
                res.json({
                    code : 0,
                    email : req.session.verifPaypalValidity.email
                })
            }else{
                res.json({code : 1});
            }
            
        }else{
            //console.log("no session")
            res.json({code : 1});
        }
        
            
    });


    function getLocalProducer(fields){
        var producer = {
            lastNameProducer : fields.lastName,
            firstNameProducer : fields.firstName,
            birthProducer : fields.birth,
            sexProducer : fields.sex,
            emailProducer : fields.email,
            phoneProducer : fields.phone,
            addressProducer : fields.address,
            cityProducer : fields.city,
            cpProducer : fields.cp,
            avatarProducer : "",
            descriptionProducer : fields.description,
            comment : []
        };
        return producer;
    }

}