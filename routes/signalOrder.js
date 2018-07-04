module.exports = function(app, urlApi, utils, config) {

    var rp = require("request-promise");

    app.get("/signalOrder/:id", function(req, res, next) {
        if(!req.session.type || !req.params.id || req.params.id =="") {
			res.redirect("/");
        }else{
            var msgError="";
            var msgSuccess ="";
            if(req.query.msgError && req.query.msgError!=""){
                msgError = req.query.msgError
            }
            if(req.query.msgSuccess && req.query.msgSuccess!=""){
                msgSuccess = req.query.msgSuccess
            }
            var motifs;
            rp({
                url: urlApi + "/motif/order",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(function (body) {
               
                motifs = JSON.parse(body).result;
                rp({
                    url: urlApi + "/order/getOrderDetailsFromUser",
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
                        res.render("signalOrder.ejs", {
                            session: req.session,
                            msgError:msgError,
                            msgSuccess: msgSuccess,
                            items: body.result,
                            motifs: motifs
                        });
                    }else{
                        res.redirect("/");
                    }
                }).catch(function(err){
                    res.redirect("/");
                })            
            }).catch(function(err){ 
                res.redirect("/");
            })
        }
    });

    app.post("/signalOrder/:id", function(req, res, next) {
        if(!req.session.type || !req.params.id || req.params.id =="") {
            res.redirect("/");
        }else{
            if(!req.body.idMotif){
                res.redirect("/signalOrder/"+req.params.id+"?msgError=Veuillez saisir un motif.")
            }else if(!req.body.idLigneOrder || req.body.idLigneOrder.length == 0){
                res.redirect("/signalOrder/"+req.params.id+"?msgError=Veuillez saisir au moins un produit.")
            }else if(!req.body.descriptionSignalOrder || req.body.descriptionSignalOrder.length>500 || req.body.descriptionSignalOrder.length<20){
                res.redirect("/signalOrder/"+req.params.id+"?msgError=Veuillez saisir une description de votre problème comprise entre 20 et 500 caractères.")
            }else{
                rp({
                    url: urlApi + "/signalOrder",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "idOrder" : req.params.id,
                        "idLigneOrder" : req.body.idLigneOrder,
                        "descriptionSignalOrder": req.body.descriptionSignalOrder,
                        "idMotif": req.body.idMotif
                    }
                }).then(function (body) {
                    
                    if(body.code == 0){
                        res.redirect("/userDashboard/orders?msgSuccess=Votre signalement a bien été enregistré.")
                    }else{
                        res.redirect("/signalOrder/"+req.params.id+"?msgError=Erreur lors de l'enregistrement de votre demande. Merci de réessayer ultérieurement. ")
                    }
                }).catch(function(err){
                    res.redirect("/");
                })            
            }
            
        }
    });

}