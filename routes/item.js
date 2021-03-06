module.exports = function(app, urlApi, utils){
  var rp = require("request-promise");
  var formidable = require("formidable");
  var fs = require('fs');
	
	app.get('/item/new', function(req, res, next) {
    var msgError;
    var unitsList;
    var categoriesList;
		if(req.session.type && req.session.type == 1) {
      msgError="";
      msgSuccess="";
      rp({
        url: urlApi + "/units",
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      }).then(function (body) {
        
        if (body.code == 3) {
          res.render("itemCreate.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
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
              res.render("itemCreate.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
            } else {
              var jsonCategory = JSON.parse(body);
              categoriesList = jsonCategory.result;
              res.render('itemCreate.ejs', { msgError: "", msgSuccess:msgSuccess, units: unitsList, categories: categoriesList, session : req.session });
            }
          }).catch(function (err) {
            console.log(err);
            res.render("itemCreate.ejs", { msgError: "Erreur inconnue. Merci de réessayer.", msgSuccess:msgSuccess, session: req.session });
          });
        }
      }).catch(function (err) {
        console.log(err);
        res.render("itemCreate.ejs", { msgError: "Erreur inconnue. Merci de réessayer.", msgSuccess:msgSuccess, session: req.session });
      });
		}else{
			res.redirect("/");
		}
	});

  app.get('/item/edit/:id', function(req, res, next) {
    var msgError;
    var unitsList;
    var categoriesList;
    var item;
		if(req.session.type && req.session.type == 1 && req.params.id) {
      rp({
        url: urlApi + "/item",
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        json: {
          "idItem": req.params.id,
        }
      }).then(function (body) {
        if(body.result.infoItem.loginUser!=req.session.login){
          res.render("erreur.ejs", {
            session: req.session,   
            msgError:"Cette annonce ne vous appartient pas!",
            msgSuccess: ""
          });
        }else{
          if(body.code == 0){
            item = body.result.infoItem;
            console.log(item);
          }else {
            res.render("erreur.ejs", {
            session: req.session,   
            msgError:"Erreur dans la récupération de l'annonce",
            msgSuccess: ""
            });
          }
        }
        msgError="";
        msgSuccess="";
        rp({
          url: urlApi + "/units",
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (body) {
          if (body.code == 3) {
            res.render("itemCreate.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
          } else {
            var jsonUnit = JSON.parse(body);
            unitsList = jsonUnit.result;
            rp({
              url: urlApi + "/categories",
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            }).then(function (body) {
              if (body.code == 3) {
                res.render("itemCreate.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
              } else {
                var jsonCategory = JSON.parse(body);
                categoriesList = jsonCategory.result;
                res.render('itemCreate.ejs', { msgError: "", msgSuccess:msgSuccess, item: item, urlApi: urlApi, units: unitsList, categories: categoriesList, session : req.session });
              }
            }).catch(function (err) {
              console.log(err);
              res.render("itemCreate.ejs", { msgError: "Erreur inconnue. Merci de réessayer.", msgSuccess:msgSuccess, session: req.session });
            });
          }
        }).catch(function (err) {
          console.log(err);
          res.render("itemCreate.ejs", { msgError: "Erreur inconnue. Merci de réessayer.", msgSuccess:msgSuccess, session: req.session });
        });
      }).catch(function (err) {
        console.log(err);
        res.render("erreur.ejs", {
          session: req.session,   
          msgError:"erreur inconnue",
          msgSuccess: ""
        });
      });
		}else{
			res.redirect("/");
		}
	});

  app.post('/item/new', function(req, res, next) {
    var msgError;
    var unitsList;
    var categoriesList;
    console.log(req.session.type);
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
        
        if(msgError != ""){
          res.render('itemCreate.ejs', {msgError:msgError, msgSuccess:msgSuccess, session : req.session});
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
              "token": req.session.token
            }
        }).then(function (body) {
          if (body) {
            if (body.code == "0") {
              res.render("itemCreate.ejs", {
                msgError: "",
                msgSuccess: "Annonce créée !",
                session: req.session
              }); 
            }
            else {
              res.render("itemCreate.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                msgSuccess: "", session: req.session });
            }
          } else {

            res.render("connexion.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                msgSuccess: "", session: req.session });
          }
        }).catch(function (err) {
              console.log(err);
              res.render("itemCreate.ejs", {
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

  app.post('/item/edit', function(req, res, next) {
    var msgError;
    var unitsList;
    var categoriesList;
    var item;
		if(req.session.type && req.session.type == 1) {
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
            msgError += "L'un des fichiers utilisés pour les photos n'est pas conforme : \nExtensions acceptées :  \n\rPoid maximum : 5Mo  ";
          }
        }
      item= {
          "id": fields.idItem,
          "fileExtensions": fields.fileExtensions,
          "productId": fields.product,
          "name": fields.name,
          "description": fields.description,
          "address": fields.address,
          "location": fields.location,
          "city": fields.city,
          "price": fields.price,
          "unitId": fields.unit,
          "quantity": fields.quantity
      };
      rp({
        url: urlApi + "/item/edit",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        json: {
          "item": item,
          "photo": files.photo,
          "token": req.session.token
        }
      }).then(function (body) {
        if(body){
          console.log("body set");
          if (body.code == "0") {
            res.render("itemCreate.ejs", { msgError: "", msgSuccess:"Annonce modifiée avec succès", session: req.session });
          }
          else {
                res.render("itemCreate.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                  msgSuccess: "", session: req.session });
          }
        } else {
          res.render("itemCreate.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                msgSuccess: "", session: req.session });
        }
        }).catch(function (err) {
            
            res.render("itemCreate.ejs", {
              msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
              msgSuccess: "",
              session: req.session
            });
        });
      });
    }else{
      console.log("redirect");
			res.redirect("/");
		}
  });

  app.post('/item/delete', function(req, res, next) {
    var msgError;
    var unitsList;
    var categoriesList;
    var item;
		if(req.session.type && req.session.type == 1) {
      var form = new formidable.IncomingForm();
      form.multiples=true;
      form.parse(req, function (err, fields, files) {
        rp({
          url: urlApi + "/item/delete",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "id": fields.idItem,
            "token": req.session.token
          }
        }).then(function (body) {
          if(body){
            
            if (body.code == "0") {
              res.render("itemCreate.ejs", { msgError: "", msgSuccess:"Annonce supprimée avec succès", session: req.session });
            }
            else {
                  res.render("itemCreate.ejs", { msgError: "Erreur lors de la suppression de l'annonce. Veuillez recommmencer !",
                    msgSuccess: "", session: req.session });
            }
          } else {
            res.render("itemCreate.ejs", { msgError: "Erreur lors de la suppression de l'annonce. Veuillez recommmencer !",
                  msgSuccess: "", session: req.session });
          }
          }).catch(function (err) {
            res.render("itemCreate.ejs", {
              msgError: "Erreur lors de la suppression de l'annonce. Veuillez recommmencer !",
              msgSuccess: "",
              session: req.session
            });
          });
      });
    }else{
			res.redirect("/");
		}
  });
};