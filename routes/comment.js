module.exports = function(app, urlApi, urlLocal, utils){

    var rp = require("request-promise");

    app.get("/letComment/:id", function(req, res, next) { 
        var msgError ="";
        if(req.query.msgError && req.query.msgError!= ""){
            msgError=req.query.msgError;
        }
        if(!req.session.type || !req.params.id || req.params.id =="") {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/getPublicInformations",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "idProducer": req.params.id,
                }
            }).then(function (body) { 
                if(body.code ==0){ 
                    res.render("letComment.ejs", {
                        session : req.session,
                        producer: body.result,
                        idProducer : req.params.id,
                        msgError: msgError,
                        msgSuccess: ""
                    });
                }else{
                    res.render("letComment.ejs", {
                        session: req.session,
                        producer: null,
                        idProducer: null,
                        msgError: msgError,
                        msgSuccess: ""
                    });
                }
            }).catch(function(err){
                res.redirect("/");
            });
        }
    });

    app.post("/letComment/:id", function(req, res, next) { 
        if(!req.session.type || !req.params.id || req.params.id =="") {
            res.redirect("/");
        }else{
            if(!req.body.stars){
                res.redirect("/letComment/"+req.params.id+"?msgError=Veuillez Evaluer le producteur pour laisser un commentaire.");
            }else{
                rp({
                    url: urlApi + "/commentProducer",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "idProducer": req.params.id,
                        "loginUser": req.session.login,
                        "token": req.session.token,
                        "stars" : req.body.stars,
                        "comment" : req.body.comment
                    }
                }).then(function (body) { 
                    console.log(body);
                    if(body.code == 0){
                        res.redirect("/");
                    }else{
                        res.redirect("/letComment/"+req.params.id+"?msgError=Erreur lors de l'enregistrement du commentaire. Merci de rééssayer ulterieurement.")
                    }
                });
            }
        }
    })


}