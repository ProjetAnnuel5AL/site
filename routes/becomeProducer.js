module.exports = function(app, urlApi, utils){

    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/becomeProducer", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else if(req.session.type =="producer"){
            res.redirect("/updateProducer")
        }else{
            res.render("becomeProducer.ejs", {
                session: req.session,
                producer: {},
                msgError:"",
                msgSuccess: ""
            });
        }
    });

    app.post("/becomeProducer", function(req, res, next) {
        if(!req.session.type) {
			res.redirect("/");
		}else if(req.session.type =="producer"){
            res.redirect("/updateProducer")
        }else{
            var form = new formidable.IncomingForm();
            
            form.parse(req, function (err, fields, files) {
            
                var localProducer = getLocalProducer(fields);
                var extensionT = files.avatar.name.split('.');
                var extension = extensionT[extensionT.length-1];

                if(files.avatar.name !="" && ( files.avatar.size> 5242880  ||  (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" && extension != "bmp" && extension != "tif" && extension != "tiff"))){
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Le fichier utilisé pour la photo n'est pas confomre : \nExtensions acceptées :  \n\rPoid maximum : 5Mo  ",
                        msgSuccess: ""
                    });
                }else if(!fields.lastName) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un nom !",
                        msgSuccess: ""
                    });
                }else if(!fields.firstName) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un prénom !",
                        msgSuccess: ""
                    });
                }else if(!fields.birth) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une date de naissance !",
                        msgSuccess: ""
                    });
                }else if(!fields.sex) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un sexe !",
                        msgSuccess: ""
                    });
                }else if(!fields.email) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un email !",
                        msgSuccess: ""
                    });
                }else if(!fields.phone) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un numéro de téléphone !",
                        msgSuccess: ""
                    });
                }else if(!fields.address) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une adresse !",
                        msgSuccess: ""
                    });
                }else if(!fields.city) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une ville !",
                        msgSuccess: ""
                    });
                }else if(!fields.cp) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un code postal !",
                        msgSuccess: ""
                    });
                }else if(!fields.description || fields.description.length<20 || fields.description.length>500) {
                    res.render("becomeProducer.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une description ayant entre 20 et 500 caractères  !",
                        msgSuccess: ""
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
                        }
                    }).then(function(body) {   
                        if(body.code == 0){
                            req.session.type=1;
                            res.render("ficheProducer.ejs", {
                                session: req.session,
                                producer: localProducer,
                                msgError:"",
                                msgSuccess: "Vous êtes désormais enregistré en temps que producteur ! Vous trouverez ci-dessous votre fiche personnel. Un nouvel onglet a également été ajouté pour vous permettre de gérer vos ventes."
                            });
                        }else{
                            console.log(body);
                            res.render("becomeProducer.ejs", {
                                session: req.session,
                                producer: localProducer,
                                msgError:"Erreur inconnu 2. Merci de réessayer ultérieurement.",
                                msgSuccess: ""
                               
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        res.render("becomeProducer.ejs", {
                            session: req.session,
                            producer: localProducer,
                            msgError:"Erreur inconnu 1. Merci de réessayer ultérieurement.",
                            msgSuccess: ""
                        });
                    });

                   
                }            
            });
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
            descriptionProducer : fields.description
        };
        return producer;
    }

}