module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");

    app.get("/visualisationAnnonce/:id", function(req, res) {
        var photo;
        var item;
        var lat;
        var long;
        
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
            
            
            if(body.code ==0){
                item=body;
                var LatLong = body.infoItem.location.split(',');
                lat = LatLong[0];
                long = LatLong[1];

                if(body.infoItem.photoURL == "default"){
                    photo = "../img/nophoto.png";
                }else{
                    photo = config.urlItemPhoto +"/"+  req.params.id +"/"+ body.infoItem.photoURL
                }
              
                res.render("visualisationAnnonce.ejs", {
                    session: req.session,
                    item : item,
                    photo : photo,
                    lat : lat,
                    long : long,
                    msgError:"",
                    msgSuccess: ""
                });
            }else{
                res.render("visualisationAnnonce.ejs", {
                    session: req.session,
                    item : item,
                    photo : photo,
                    lat : lat,
                    long : long,
                    msgError:"Cette annonce n'existe pas",
                    msgSuccess: ""
                });
            }
            
        
        }).catch(function (err) {
        //console.log(err);

            res.render("erreur.ejs", {
                session: req.session,   
                msgError:"erreur inconnu",
                msgSuccess: ""
            });
        });
        
    });

};
