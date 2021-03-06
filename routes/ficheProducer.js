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
            var lat;
            var long;
            if(body.code ==0){
                var producer = body.result;
                producer.idProducer = req.params.id;
                var avatar = "";
               
                if(body.result.avatarProducer == "default"){
                    avatar = "../img/avatar.png";
                }else{
                    var avatarProducer = body.result.avatarProducer.split('.');
                    
                    avatar = config.urlAvatarProducer +"/"+  req.params.id +"/img_resize/"+ avatarProducer[0]+"_ms."+avatarProducer[1];
                }
                var LatLong = producer.locationProducer.split(',');
                lat = LatLong[0];
                long = LatLong[1]; 
                

                producer.descriptionProducer = producer.descriptionProducer.replace(/\n|\r/g,'<br />'); 
                res.render("ficheProducer.ejs", {
                    session: req.session,
                    producer: producer,
                    lat : lat,
                    long : long,
                    avatar: avatar,
                    msgError:"",
                    msgSuccess: ""
                });
                
            }else{
                res.render("ficheProducer.ejs", {
                    session: req.session,
                    producer: "",
                    lat : lat,
                    long : long,
                    avatar: "",
                    msgError:"Ce producteur n'existe pas !",
                    msgSuccess: ""
                });
            }
            
        
        });
    });
};