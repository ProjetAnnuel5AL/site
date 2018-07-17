module.exports = function(app, urlApi, urlLocal, utils){

    var rp = require("request-promise");

    app.get("/letComment/:id", function(req, res, next) { 
        if(req.query.idNotif && req.query.idNotif != "" ){
            rp({
                url: urlApi + "/notification/idItem",
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json"
                },
                json: {
                  "id": req.query.idNotif,
                  "token": req.session.token
                }
              }).then(function (body) { 

              });
        }
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
            console.log(req.body);
            var stars = req.body.stars;
            if(req.body.stars == ""){
                stars = "0";
            }
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
                    "stars" : stars,
                    "comment" : req.body.comment
                }
            }).then(function (body) { 
                
                if(body.code == 0){
                    res.redirect("/");
                }else{
                    res.redirect("/letComment/"+req.params.id+"?msgError=Erreur lors de l'enregistrement du commentaire. Merci de rééssayer ulterieurement.");
                }
            });
       }
        
    });


};