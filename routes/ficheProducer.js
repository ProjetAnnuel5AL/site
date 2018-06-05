module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/ficheProducer/:id", function(req, res, next) {
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
                var producer = body;
                var avatar = "";
               
                if(body.avatarProducer == "default"){
                    avatar = "../img/avatar.png";
                }else{
                    avatar = config.urlAvatarProducer +"/"+  req.params.id +"/"+ body.avatarProducer
                }
                
              
                res.render("ficheProducer.ejs", {
                    session: req.session,
                    producer: producer,
                    avatar: avatar,
                    msgError:"",
                    msgSuccess: ""
                });
            }else{
                res.render("ficheProducer.ejs", {
                    session: req.session,
                    producer: "",
                    avatar: "",
                    msgError:"Ce producteur n'existe pas !",
                    msgSuccess: ""
                });
            }
            
        
        });
    });
}