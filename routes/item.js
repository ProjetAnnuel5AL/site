module.exports = function(app, urlApi, utils){
  var rp = require("request-promise");
  var formidable = require("formidable");
  var fs = require('fs');
 
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	
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
        }
      }).then(function (body) {
        if (body.code == 3) {
          res.render("itemCreate.ejs", { msgError: body.message, msgSuccess:msgSuccess, session: req.session });
        } else {
          unitsList = JSON.parse(body);
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
              categoriesList = JSON.parse(body);
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
        
        if(body.infoItem.login!=req.session.login){
          res.render("erreur.ejs", {
            session: req.session,   
            msgError:"Cette annonce ne vous appartient pas!",
            msgSuccess: ""
          });
        }else{
          if(body.code == 0){
            item = body.infoItem;
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
            unitsList = JSON.parse(body);
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
                categoriesList = JSON.parse(body);
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
        if(!fields.name){
          msgError += "\n Veuillez saisir le nom de votre produit ! ";
        }
        if(!fields.description){
          msgError += "\n Veuillez saisir la description de votre produit ! ";
        }
        if(!fields.location){
          msgError += "\n Veuillez saisir la localisation de votre produit ! ";
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
              "adress": fields.adress,
              "location": fields.location,
              "city": fields.city,
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
    console.log(req.body);
    console.log(req.session.type);
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
          "adress": fields.adress,
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
            res.render("success.ejs", { msgError: "", msgSuccess:"Annonce modifiée avec succès", session: req.session });
          }
          else {
                res.render("erreur.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                  msgSuccess: "", session: req.session });
          }
        } else {
          res.render("erreur.ejs", { msgError: "Erreur lors de la création de l'annonce. Veuillez recommmencer !",
                msgSuccess: "", session: req.session });
        }
        }).catch(function (err) {
              console.log(err);
              res.render("erreur.ejs", {
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
};