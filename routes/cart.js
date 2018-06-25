module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/cart/add", function(req, res, next) {      
        if(req.session.type){ 
          
            //on vérifie que on a pas déjà l'annonce dans le panier
            var exist = false;
            for(var i =0; i<req.session.cart.length; i++){
                if(req.session.cart[i].id == req.query.id){
                    exist = true;
                    if(req.query.qteMax == req.session.cart[i].qteMax) {
                        if((parseInt(req.session.cart[i].qte) + parseInt(req.query.qte)) > parseInt(req.query.qteMax)){
                            res.json({
                                code : 1,
                                message : "Vous avez déjà "+ req.session.cart[i].qte+ " " + req.query.unit + "(s) dans votre panier. Vous ne pouvez pas en commander plus de "+req.query.qteMax+ " " + req.query.unit + " Veuillez recommencer avec une quantité valide !"
                            });
                        }else{
                            req.session.cart[i].qte += parseInt(req.query.qte);
                            res.json({
                                code : 0,
                                message : ""
                            });
                        }
                    }
                    //dans le cas ou la quantité dispo a changé 
                    else{
                        if(req.query.qteMax == 0) {
                            req.session.cart.splice(i,1);
                            res.json("Oups ! Ce produit n'est plus disponible. Nous allons le supprimer de votre panier.")
                        }
                        else if(parseInt(req.session.cart[i].qte)> parseInt(req.query.qteMax)){
                            req.session.cart[i].qteMax = parseInt(req.query.qteMax);
                            req.session.cart[i].qte = parseInt(req.query.qteMax);
                            res.json({
                                code : 1,
                                message : "Oups ! Il n'y a plus que "+req.query.qteMax+ " " + req.query.unit + " disponible ! Nous avons modifier votre panier en conséquence."
                            });
                        }else if((parseInt(req.session.cart[i].qte) + parseInt(req.query.qte)) > parseInt(req.query.qteMax)){
                            req.session.cart[i].qteMax = parseInt(req.query.qteMax);
                            res.json({
                                code : 1,
                                message : "Vous avez déjà "+ req.session.cart[i].qte+ " " + req.query.unit + "(s) dans votre panier. Vous ne pouvez pas en commander plus de "+req.query.qteMax+ " " + req.query.unit + " Veuillez recommencer avec une quantité valide !"
                            });
                        }else{
                            req.session.cart[i].qteMax = parseInt(req.query.qteMax);
                            req.session.cart[i].qte += parseInt(req.query.qte);
                            res.json({
                                code : 0,
                                message : ""
                            });
                        }
                    }
                   
                    break;
                }
            }

            if(exist == false){
                var jsonCart = {};
                jsonCart.id = req.query.id;
                jsonCart.qte = parseInt(req.query.qte);
                jsonCart.qteMax = parseInt(req.query.qteMax);
                jsonCart.unit = req.query.unit;
                jsonCart.category = req.query.category;
                jsonCart.product = req.query.product;
                jsonCart.title = req.query.title;
                jsonCart.prixU = req.query.prixU;
                jsonCart.img = urlApi+'/itemPhotos/'+req.query.id+'/0.'+req.query.ext
                req.session.cart.push(jsonCart)
                res.json({
                    code : 0,
                    message : ""
                });
            }
        }else{
            res.json({
                code : 1,
                message : "Vous n'êtes pas connecté !"
            });
        }     
    });

    app.get("/cart/delete", function(req, res, next) {      
        if(req.session.type){ 
            var deleted = false;
            for(var i =0; i<req.session.cart.length; i++){
                if(req.session.cart[i].id == req.query.id){                 
                    req.session.cart.splice(i,1);
                    deleted =true;
                    break;
                }
            }

            if(deleted == false){
                res.json({
                    code : 1,
                    message : "Erreur lors de la suppression : l'article n'est pas dans le panier"
                });
            }else{
                res.json({
                    code : 0,
                    message : ""
                });
            }
        }else{
            res.json({
                code : 1,
                message : "Vous n'êtes pas connecté !"
            });
        }     
    });

    app.get("/cart/verifyDispo/:id", function(req, res, next) {      
        if(req.session.type){ 
            if(!req.params.id || req.params.id==""){
                res.json({
                    code : 1,
                    message : "Erreur : Aucun article sélectionné pour la modification de quantité."
                });
            }else{
                
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
                    if(body.code == 0){
                        if(body.infoItem.quantity >0){
                            res.json({
                                code: 0,
                                message :"",
                                max : body.infoItem.quantity,
                                itemName : body.infoItem.itemName
                            })
                        }else{
                            res.json({
                                code: 2,
                                message :"Oups ! On dirait que cette annonce n'existe plus. Nous allons la supprimer de votre pannier.",
                            })
                        }
                       
                    }else{
                        res.json({
                            code: 2,
                            message :"Oups ! On dirait que cette annonce n'existe plus. Nous allons la supprimer de votre pannier.",
                        })
                    }
                }).catch(function (err) {
                    //console.log(err);
                    res.json({
                        code : 1,
                        message : "Erreur inatendu. Merci de réassayer plus tard."
                    });
                });
            }
        }else{
            res.json({
                code : 1,
                message : "Vous n'êtes pas connecté !"
            });
        }   
    });

    app.get("/cart", function(req, res, next) {      
        
        if(req.session.type){   
                   
            res.render("cart.ejs", {
                session: req.session,
                cart: req.session.cart,
                msgError:"",
                msgSuccess: ""
            });
        }else{
            res.redirect("/login");
        }   
    });
}