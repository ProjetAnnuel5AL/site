module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/cart/add", function(req, res, next) {      
        if(req.session.type){ 
            console.log(req.query);
            //on vérifie que on a pas déjà l'annonce dans le panier
            var exist = false;
            for(var i =0; i<req.session.cart.length; i++){
                if(req.session.cart[i].id == req.query.id){
                    exist = true;
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



    app.get("/cart", function(req, res, next) {      
        console.log(req.session.cart);
        if(req.session.type){   
                   
            res.render("cart.ejs", {
                session: req.session,
                cart: req.session.cart,
                msgError:"",
                msgSuccess: ""
            });
        }else{
            res.redirect("/connexion");
        }   
    });
}