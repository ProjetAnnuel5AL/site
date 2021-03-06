module.exports = function(app, urlApi, urlLocal, utils, config){

    var rp = require("request-promise");
    var bcrypt = require("bcrypt-nodejs");
    var fs = require("fs");
    var http = require('http');
    var formidable = require("formidable");


    app.get("/producerDashboard/profil", function(req, res, next) {
        if(!req.session.type && req.session.type != 1) {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/producer/getProducer",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token": req.session.token
                }
            }).then(function (body) {
                var producer = body.result;  
                var avatar = "";
                
                if(body.code == 0){
                    if(body.result.avatarProducer == "default"){
                        avatar = "../img/avatar.png";
                    }else{
                        var avatarProducer = body.result.avatarProducer.split('.');
                        avatar = config.urlAvatarProducer +"/"+  producer.idProducer +"/img_resize/"+ avatarProducer[0]+"_small."+ avatarProducer[1];
                    }
                    producer.avatarProducer = avatar;
                
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: producer,
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal,
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    res.redirect("/");
                }
               
            });
        }
    });


    app.post("/producerDashboard/profil", function(req, res, next) {
        if(!req.session.type && req.session.type != 1) {
			res.redirect("/");
		}else{
            var form = new formidable.IncomingForm();
            
            form.parse(req, function (err, fields, files) {
                var LatLong = fields.location.split(',');
                lat = LatLong[0];
                long = LatLong[1];
                var localProducer = getLocalProducer(fields,lat,long);
                var extensionT = files.avatar.name.split('.');
                var extension = extensionT[extensionT.length-1];

                var ibanExtensionT = files.iban.name.split('.');
                var ibanExtension = ibanExtensionT[ibanExtensionT.length-1];

                if(files.avatar.name !="" && ( files.avatar.size> 5242880  ||  (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" && extension != "bmp" && extension != "tif" && extension != "tiff"))){
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Le fichier utilisé pour la photo n'est pas confomre : \nExtensions acceptées :  \n\rPoid maximum : 5Mo  ",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(files.iban.name && ibanExtension != "pdf"){
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Le fichier utilisé pour la votre IBAN/RIB n'est pas confomre : \nExtensions acceptées : .pdf ",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.lastName) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un nom !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.firstName) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un prénom !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.sex) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un sexe !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.email) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un email !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.phone) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir un numéro de téléphone !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.address) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une adresse !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.city) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une ville !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.paypalChange || (fields.paypalChange=="true" && !fields.emailPaypal)) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez renseigner un compte paypal valide !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else if(!fields.description || fields.description.length<20 || fields.description.length>500) {
                    res.render("producerDashboard/producerDashboardProfil.ejs", {
                        session: req.session,
                        producer: localProducer,
                        msgError:"Veuillez saisir une description ayant entre 20 et 500 caractères !",
                        msgSuccess: "",
                        paypalClientId :config.paypalClientId,
                        paypalMode : config.paypalMode,
                        urlLocal: urlLocal
                    });
                }else{  
                    var iban =null;
                    if (files.iban.name && files.iban.name!=""){
                        iban = files.iban;
                    }
                    rp({
                        url: urlApi + "/producer/update",
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
                            "birthProducer": null,
                            "sexProducer": fields.sex,
                            "addressProducer": fields.address,
                            "cityProducer": fields.city,
                            "locationProducer": fields.location,
                            "descriptionProducer": fields.description,
                            "paypalProducer": fields.emailPaypal,
                            "cpProducer": fields.cp,
                            "photoChange" : fields.photoChange,
                            "paypalChange" : fields.paypalChange,
                            "ibanProducer": files.iban
                        }
                    }).then(function(body) {   
                        if(body.code == 0){
                            var avatar ="";
                            if(files.avatar.name==""){
                                avatar = "../img/avatar.png";
                            }else{
                                avatar = config.urlAvatarProducer +"/"+  body.result.id +"/avatar."+extension;
                            }
                            localProducer.avatarProducer = avatar;
                            req.session.verifPaypalValidity = {};
                            res.render("producerDashboard/producerDashboardProfil.ejs", {
                                session: req.session,
                                producer: localProducer,
                                msgError:"",
                                msgSuccess: "Modification effectuée.",
                                paypalClientId :config.paypalClientId,
                                paypalMode : config.paypalMode,
                                urlLocal: urlLocal,
                            });
                        }else{

                            res.render("producerDashboard/producerDashboardProfil.ejs", {
                                session: req.session,
                                producer: localProducer,
                                msgError:"Erreur inconnu 2. Merci de réessayer ultérieurement.",
                                msgSuccess: "",
                                paypalClientId :config.paypalClientId,
                                paypalMode : config.paypalMode,
                                urlLocal: urlLocal
                               
                            });
                        }
                    }).catch(function (err) {
                        //console.log(err);
                        res.render("producerDashboard/producerDashboardProfil.ejs", {
                            session: req.session,
                            producer: localProducer,
                            msgError:"Erreur inconnu 1. Merci de réessayer ultérieurement.",
                            msgSuccess: "",
                            paypalClientId :config.paypalClientId,
                            paypalMode : config.paypalMode,
                            urlLocal: urlLocal
                        });
                    });
                }            
            });
        }
    });

    function getLocalProducer(fields, lat, long){
        var producer = {
            lastNameProducer : fields.lastName,
            firstNameProducer : fields.firstName,
            birthProducer : fields.birth,
            sexProducer : fields.sex,
            emailProducer : fields.email,
            phoneProducer : fields.phone,
            addressProducer : fields.address,
            cityProducer : fields.city,
            locationProducer : fields.location,
            avatarProducer : "",
            descriptionProducer : fields.description,
            cpProducer : fields.cp,
            latProducer : lat,
            longProducer : long,
            paypalProducer: fields.emailPaypal,
            comment : []
        };
        return producer;
    }


    app.get("/producerDashboard/item/new", function(req, res, next) {
        var msgError;
        var unitsList;
        var categoriesList;
        var deliveryList;
		if(req.session.type && req.session.type == 1) {
            msgError="";
            msgSuccess="";
            rp({
                url: urlApi + "/delivery",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(function (body) { 
                if (body.code == 3) {
                    res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
                } else {
                    var jsonDelivery = JSON.parse(body);
                    deliveryList = jsonDelivery.result;
                    rp({
                        url: urlApi + "/units",
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        },
                    }).then(function (body) {  
                        if (body.code == 3) {
                            res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
                        } else {
                        var jsonUnit = JSON.parse(body);
                        unitsList = jsonUnit.result;
                        rp({
                            url: urlApi + "/categories",
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            },
                        }).then(function (body) {
                            if (body.code == 3) {
                                res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
                            } else {
                                var jsonCategory = JSON.parse(body);
                                categoriesList = jsonCategory.result;
                                res.render('producerDashboard/producerDashboardItemNew.ejs', { msgError: "", msgSuccess:msgSuccess, deliverys: deliveryList, units: unitsList, categories: categoriesList, session : req.session });
                            }
                        }).catch(function (err) {
                            res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: "Erreur inconnue. Merci de réessayer.", msgSuccess:msgSuccess, session: req.session });
                        });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: "Erreur inconnue. Merci de réessayer.", msgSuccess:msgSuccess, session: req.session });
                    });
                }
            });
           
        }else{
            res.redirect("/");
        }
    });

    
    app.post('/producerDashboard/item/new', function(req, res, next) {
        var msgError;
        var unitsList;
        var categoriesList;
        if(req.session.type && req.session.type == 1) {
            msgError="";
            msgSuccess="";
            var form = new formidable.IncomingForm();
            form.multiples=true;
            form.parse(req, function (err, fields, files) {
                if(!Array.isArray(files.photo)){
                    var arr = [];
                    arr.push(files.photo);
                    files.photo = arr;
                }
                for (var photo in files.photo) {
                    var extensionT = files.photo[photo].name.split('.');
                    var extension = extensionT[extensionT.length - 1];
                    if (files.photo[photo].size > 5242880 || (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" && extension != "bmp" && extension != "tif" && extension != "tiff")) {
                        msgError += "L'un des fichiers utilisés pour les photos n'est pas conforme : \nExtensions acceptées :  \n\rPoid maximum : 5242880  ";
                    }
                }
                if(!fields.name || fields.name.length>50){
                    msgError += "\n Veuillez saisir le nom de votre produit ayant au maximum 50 caractères !";
                }
                if(!fields.description || fields.description.length<20 || fields.description.length>500){
                    msgError += "\n Veuillez saisir une description de votre produit ayant entre 20 et 500 caractères !";
                }
                if(!fields.location){
                    msgError += "\n Veuillez saisir la localisation de votre produit ! ";
                }
                if(!fields.quantity || fields.quantity <=0){
                    msgError += "\n Veuillez saisir une quantité ! ";
                }
                if(!fields.unit){
                    msgError += "\n Veuillez saisir une unité ! ";
                }
                if(!fields.price){
                    msgError += "\n Veuillez saisir un prix ! ";
                }
                if(!fields.city){
                    msgError += "\n Veuillez saisir une adresse ! ";
                }
                if(!fields.address){
                    msgError += "\n Veuillez saisir une adresse ! ";
                } 
                if(!fields.idDelivery){
                    msgError += "\n Veuillez saisir un transporteur ! ";
                }
                if(!fields.shippingCost){
                    msgError += "\n Veuillez saisir des frais de port ! ";
                } 
                if(!fields.deliveryTimeStart || isInt(fields.deliveryTimeStart) == false || !fields.deliveryTimeEnd || isInt(fields.deliveryTimeEnd) == false){
                    msgError += "\n Veuillez estimer la durée de la livraison ! ";
                }  
                if(!fields.quatityMaxOrder || fields.quatityMaxOrder <=0){
                    msgError += "\n Veuillez saisir une quantité maximum par commande ! ";
                }
                if(msgError != ""){
  
                    res.render('producerDashboard/producerDashboardItemNew.ejs', {msgError:msgError, msgSuccess:msgSuccess, session : req.session});
                }else{
                    rp({
                        url: urlApi + "/item",
                        method: "POST",
                        headers: {
                        "Content-Type": "application/json"
                        },
                        json: {
                            "productId": fields.product,
                            "name": fields.name,
                            "description": fields.description,
                            "address": fields.address,
                            "location": fields.location,
                            "city": fields.city,
                            "cp": fields.cp,
                            "photo": files.photo,
                            "price": fields.price,
                            "unitId": fields.unit,
                            "quantity": fields.quantity,
                            "deliveryTime" : fields.deliveryTimeStart + ";" + fields.deliveryTimeEnd,
                            "idDelivery":fields.idDelivery,
                            "shippingCost":fields.shippingCost,
                            "quatityMaxOrder" :fields.quatityMaxOrder,
                            "token": req.session.token,
                            "loginUser" : req.session.login
                        }
                    }).then(function (body) {
                        if (body) {
                            if (body.code == "0") {
                                res.render("producerDashboard/producerDashboardItemNew.ejs", {
                                    msgError: "",
                                    msgSuccess: "Annonce créée !",
                                    session: req.session
                                }); 
                            } else {
                                res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                                msgSuccess: "", session: req.session });
                            }
                        } else {
                            res.render("producerDashboard/producerDashboardItemNew.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                                msgSuccess: "", session: req.session });
                        }
                    }).catch(function (err) {
                       
                        res.render("producerDashboard/producerDashboardItemNew.ejs", {
                            msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                            msgSuccess: "",
                            session: req.session
                        });
                    });
                }
            });
        }else{
            res.redirect("/");
        }
    });

    function isInt(value) {
        if (isNaN(value)) {
          return false;
        }
        var x = parseFloat(value);
        return (x | 0) === x;
      }

    app.get("/producerDashboard/items", function(req, res, next) {
        if(!req.session.type || req.session.type != 1) {
            res.redirect("/");
        }else{
            var msgSuccess ="";
            var msgError="";
            if(req.query.msgSuccess && req.query.msgSuccess !=""){
                msgSuccess =req.query.msgSuccess;
            }
            if(req.query.msgError && req.query.msgError !=""){
                msgError =req.query.msgError;
            }
            rp({
                url: urlApi + "/item/getItemsProducer",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token": req.session.token
                }
            }).then(function (body) {
                var items = body.result;  
                if(body.code == 0 || body.code == 1){
                    res.render("producerDashboard/producerDashboardItems.ejs", {
                        session: req.session,
                        items: items,
                        urlApi: urlApi,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }else{
                    res.redirect("/");
                }
            });
        }
    });

    
    app.get("/producerDashboard/item/update/:id", function(req, res, next) {
        var msgSuccess ="";
        var msgError="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess =req.query.msgSuccess;
        }
        if(req.query.msgError && req.query.msgError !=""){
            msgError =req.query.msgError;
        }
       
        var unitsList;
        var categoriesList;
        var item;
        var deliveryList;
        if(req.session.type && req.session.type == 1 && req.params.id) {
            rp({
                url: urlApi + "/delivery",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(function (body) { 
                if (body.code == 3) {
                    res.render("producerDashboardItemNew.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
                } else {
                    var jsonDelivery = JSON.parse(body);
                    deliveryList = jsonDelivery.result;
                    rp({
                        url: urlApi + "/item/getItemProducer",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        json: {
                            "loginUser": req.session.login,
                            "token": req.session.token,
                            "idItem" : req.params.id
                        }
                    }).then(function (body) {
                    
                        if(body.code == 0){
                            item = body.result;
                            rp({
                                uri: urlApi + "/categories",
                                method: "GET",
                                json: true,
                                headers: {
                                'User-Agent': 'Request-Promise'
                
                                }
                            }).then(function (body) { 
                                categoriesList = body.result;
                                rp({
                                    uri: urlApi + "/products",
                                    method: "GET",
                                    json: true,
                                    headers: {
                                        'User-Agent': 'Request-Promise'
                        
                                    }
                                }).then(function (body) {  
                                    productsList = body.result;
                                    rp({
                                        url: urlApi + "/units",
                                        method: "GET",
                                        headers: {
                                            "Content-Type": "application/json"
                                        }
                                    }).then(function (body) {
                                        var jsonUnit = JSON.parse(body);
                                        unitsList = jsonUnit.result;
                                        res.render('producerDashboard/producerDashboardItem.ejs', { 
                                            msgError: msgError,
                                            msgSuccess:msgSuccess, 
                                            item: item, 
                                            urlApi: urlApi, 
                                            units: unitsList, 
                                            categories: categoriesList, 
                                            deliverys: deliveryList,
                                            session : req.session 
                                        });
                                    });
                                });
                            });
                        }else{
                            res.redirect("/");
                        }
                    });
                }
        
            });  
        }else{
            
            res.redirect("/");
        }
    });
    
    app.post("/producerDashboard/item/update/:id", function(req, res, next) {
        var msgError ="";
        var unitsList;
        var categoriesList;
        var item;
        
        if(req.session.type && req.session.type == 1 && req.params.id) {
            var form = new formidable.IncomingForm();
            form.multiples=true;
            form.parse(req, function (err, fields, files) {
                if(!Array.isArray(files.photo)){
                    var arr = [];
                    arr.push(files.photo);
                    files.photo = arr;
                }
                if(req.body.photoChange == "true"){
                    for (var photo in files.photo) {
                        var extensionT = files.photo[photo].name.split('.');
                        var extension = extensionT[extensionT.length - 1];
                        if (files.photo[photo].size > 5242880 || (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" && extension != "bmp" && extension != "tif" && extension != "tiff")) {
                            msgError += "L'un des fichiers utilisés pour les photos n'est pas conforme : \nExtensions acceptées :  \n\rPoid maximum : 5242880  ";
                        }
                    }
                }
               
                if(!fields.name || fields.name.length>50){
                    msgError += "\nVeuillez saisir le nom de votre produit ayant au maximum 50 caractères !";
                }
                if(!fields.description || fields.description.length<20 || fields.description.length>500){
                    msgError += "\nVeuillez saisir une description de votre produit ayant entre 20 et 500 caractères !";
                }
                if(!fields.location){
                    msgError += "\nVeuillez saisir la localisation de votre produit ! ";
                }
                if(!fields.quantity || fields.quantity <=0){
                    msgError += "\nVeuillez saisir une quantité ! ";
                }
                if(!fields.unit){
                    msgError += "\nVeuillez saisir une unité ! ";
                }
                if(!fields.price){
                    msgError += "\nVeuillez saisir un prix ! ";
                }
                if(!fields.city){
                    msgError += "\nVeuillez saisir une adresse ! ";
                }
                if(!fields.address){
                    msgError += "\nVeuillez saisir une adresse ! ";
                }
                if(!fields.idDelivery){
                    msgError += "\n Veuillez saisir un transporteur ! ";
                }
                if(!fields.shippingCost){
                    msgError += "\n Veuillez saisir des frais de port ! ";
                } 
                if(!fields.deliveryTimeStart || isInt(fields.deliveryTimeStart) == false || !fields.deliveryTimeEnd || isInt(fields.deliveryTimeEnd) == false){
                    msgError += "\n Veuillez estimer la durée de la livraison ! ";
                }  
                if(!fields.quatityMaxOrder || fields.quatityMaxOrder <=0){
                    msgError += "\n Veuillez saisir une quantité maximum par commande ! ";
                }
                
                if(msgError != ""){
                    
                    res.redirect("/producerDashboard/item/update/"+req.params.id+"?msgError="+msgError+"&msgSuccess=");
                }else{
                    rp({
                        url: urlApi + "/item/updateProducer",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        json: {
                            "idItem": req.params.id,
                            "idProductItem": fields.product,
                            "nameItem": fields.name,
                            "descriptionItem": fields.description,
                            "addressItem": fields.address,
                            "locationItem": fields.location,
                            "cityItem": fields.city,
                            "cpItem": fields.cp,
                            "photo": files.photo,
                            "priceItem": fields.price,
                            "idUnitItem": fields.unit,
                            "quantityItem": fields.quantity,
                            "loginUser": req.session.login,
                            "token": req.session.token,
                            "addressChange": fields.addressChange,
                            "photoChange": fields.photoChange,
                            "deliveryTimeItem" : fields.deliveryTimeStart + ";" + fields.deliveryTimeEnd,
                            "idDeliveryItem":fields.idDelivery,
                            "shippingCostItem":fields.shippingCost,
                            "quatityMaxOrderItem" :fields.quatityMaxOrder,
                        }
                    }).then(function (body) {
                        if (body.code == "0") {
                            res.redirect("/producerDashboard/item/update/"+req.params.id+"?msgError=&msgSuccess=Annonce modifiée.");
                        } else {
                            res.redirect("/producerDashboard/item/update/"+req.params.id+"?msgError=Erreur 1  lors de la modification de l'annonce. Veuillez réessayer ultérieurement&msgSuccess=");
                        }
                
                    }).catch(function (err) {
                        
                        res.redirect("/producerDashboard/item/update/"+req.params.id+"?msgError=Erreur 2 lors de la modification de l'annonce. Veuillez réessayer ultérieurement&msgSuccess=");
                    });
                }
            });
        }else{
            res.redirect("/");
        }
    });

    app.post('/producerDashboard/item/delete', function(req, res, next) {
        var msgError;
        var unitsList;
        var categoriesList;
        var item;
        if(req.session.type && req.session.type == 1) {
            rp({
                url: urlApi + "/item/deleteProducer",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "id": req.body.idItem,
                    "token": req.session.token,
                    "loginUser": req.session.login
                }
            }).then(function (body) {
                if(body){
                    if (body.code == "0") {
                        res.redirect("/producerDashboard/items?msgError=&msgSuccess=Annonce supprimée avec succès");
                    } else {
                        res.redirect("/producerDashboard/items?msgError=Erreur lors de la suppression de l'annonce. Veuillez recommmencer !&msgSuccess=");
                    }
                } else {
                    res.redirect("/producerDashboard/items?msgError=Erreur lors de la suppression de l'annonce. Veuillez recommmencer !&msgSuccess=");
                }
            }).catch(function (err) {
                res.redirect("/producerDashboard/items?msgError=Erreur lors de la suppression de l'annonce. Veuillez recommmencer !&msgSuccess=");
            });
           
        }else{    
            res.redirect("/");
        }
    });

    app.post('/producerDashboard/item/restock', function(req, res, next) {
        var msgError;
        var unitsList;
        var categoriesList;
        var item;
        
        if(req.session.type && req.session.type == 1) {
            if(req.body.quantity && req.body.quantity<=0){
                res.redirect("/producerDashboard/items?msgError=Pour réapprovisionner, merci de saisir une quantité.&msgSuccess=");
            }else{
                rp({
                    url: urlApi + "/item/restock",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "id": req.body.idItem,
                        "token": req.session.token,
                        "loginUser": req.session.login,
                        "quantity": req.body.quantity
                    }
                }).then(function (body) {
                    if(body){
                        if (body.code == "0") {
                            res.redirect("/producerDashboard/items?msgError=&msgSuccess=Réapprovisionnement effectué avec succès");
                        } else {
                            res.redirect("/producerDashboard/items?msgError=Erreur lors du réapprovisionnement. Veuillez recommmencer !&msgSuccess=");
                        }
                    } else {
                        res.redirect("/producerDashboard/items?msgError=Erreur lors du réapprovisionnement. Veuillez recommmencer !&msgSuccess=");
                    }
                }).catch(function (err) {
                    res.redirect("/producerDashboard/items?msgError=Erreur lors du réapprovisionnement. Veuillez recommmencer !&msgSuccess=");
                });
            }
        }else{    
            res.redirect("/");
        }
    });

    app.get("/producerDashboard/orders", function(req, res, next) {
        if(!req.session.type || req.session.type!=1) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/order/getOdrersFromProducer",
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
                    res.render("producerDashboard/producerDashboardOrders.ejs", {
                        session: req.session,
                        orders: body.result.orders,
                        status:  body.result.status,
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    res.render("producerDashboard/producerDashboardOrders.ejs", {
                        session: req.session,
                        orders: null,
                        status: null,
                        msgError:"",
                        msgSuccess: ""
                    });
                }
                
            
            });
        }
    });

    app.get("/producerDashboard/orderDetails/:id", function(req, res, next) {
        if(!req.session.type || req.session.type!=1) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/order/getOrderDetailsFromProducer",
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
                    res.render("producerDashboard/producerDashboardOrderDetail.ejs", {
                        session: req.session,
                        order: body.result,
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    res.render("producerDashboard/producerDashboardOrderDetail.ejs", {
                        session: req.session,
                        order: null,
                        msgError:"Erreur lors de la récupération de la commande. Merci de réessayer ultérieurement.",
                        msgSuccess: ""
                    });
                }
            });
        }
    });


    app.get("/producerDashboard/disputes/progress", function(req, res, next) {
        if(!req.session.type || req.session.type!=1) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/signalOrder/getSignalOrdersFromProducer",
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
                    res.render("producerDashboard/producerDashboardDisputes.ejs", {
                        session: req.session,
                        signalOrder: body.result,
                        status : "En cours",
                        msgError:"",
                        msgSuccess: ""
                    });
                }else{
                    res.render("producerDashboard/producerDashboardDisputes.ejs", {
                        session: req.session,
                        orders: null,
                        status: null,
                        msgError:"",
                        msgSuccess: ""
                    });
                }
            });
        }
    });
    
    app.get("/producerDashboard/disputes", function(req, res, next) {
        var msgSuccess ="";
        var msgError="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess =req.query.msgSuccess;
        }
        if(req.query.msgError && req.query.msgError !=""){
            msgError =req.query.msgError;
        }
        if(!req.session.type || req.session.type!=1) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/dispute/getDisputesFromProducer",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token
                }
            }).then(function (body) {
                if(body.code == 0){
                    res.render("producerDashboard/producerDashboardDisputes.ejs", {
                        session: req.session,
                        disputes: body.result,
                        msgError: msgError,
                        msgSuccess: msgSuccess
                    });
                }else{
                    res.render("producerDashboard/producerDashboardDisputes.ejs", {
                        session: req.session,
                        disputes: null,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }
            });
        }
    });

    app.get("/producerDashboard/disputeDetails/:id", function(req, res, next) {
        var msgSuccess ="";
        var msgError="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess=req.query.msgSuccess;
        }
        if(req.query.msgError && req.query.msgError !=""){
            msgError=req.query.msgError;
        }
        if(!req.session.type || req.session.type!=1) {
			res.redirect("/");
		}else{
            rp({
                url: urlApi + "/dispute/getDisputeDetailsFromProducer",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "idDispute" : req.params.id
                }
            }).then(function (body) {
                if(body.code == 0){
                    res.render("producerDashboard/producerDashboardDisputeDetail.ejs", {
                        session: req.session,
                        dispute: body.result,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }else{
                    res.render("producerDashboard/producerDashboardDisputeDetail.ejs", {
                        session: req.session,
                        dispute: null,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }
            });
        }
    });

    app.post("/producerDashboard/disputeDetails/:id", function(req, res, next) {
        if(!req.session.type || req.session.type!=1) {
			res.redirect("/");
		}else{
            //console.log(req.body)
            if(!req.body.choixLitige){
                res.redirect("/producerDashboard/disputeDetails/"+req.params.id+"?msgError=Veuillez choisir un choix.&msgSuccess=");
            }else if(req.body.choixLitige == "CONTESTED" && (!req.body.descriptionContest || req.body.descriptionContest.length>500 || req.body.descriptionContest.length<20)){
                res.redirect("/producerDashboard/disputeDetails/"+req.params.id+"?msgError=Veuillez saisir une description de votre problème comprise entre 20 et 500 caractères.&msgSuccess=");
            }else{
                var contestDescriptionDispute = null;
                if(req.body.choixLitige == "CONTESTED"){
                    contestDescriptionDispute = req.body.descriptionContest;
                }     
                
                rp({
                    url: urlApi + "/dispute/saveStatus",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "idDispute" : req.params.id,
                        "statusDispute" : req.body.choixLitige,
                        "contestDescriptionDispute" : contestDescriptionDispute
                    }
                }).then(function (body) {
                    console.log(body);
                    if(body.code == 0){
                        res.redirect("/producerDashboard/disputes?msgSuccess=Litige traité.");
                    }else{
                        res.redirect("/producerDashboard/disputes?msgError=Erreur lors du traitement du litige.");
                    }
                });
            }
        }
    });

};