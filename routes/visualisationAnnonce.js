module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");

    app.get("/visualisationAnnonce/:id", function(req, res) {
        var photo =[];
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
                item=body.result;
                var LatLong = item.infoItem.locationItem.split(',');
                lat = LatLong[0];
                long = LatLong[1];
                
                item.infoItem.descriptionItem = item.infoItem.descriptionItem.replace(/\n|\r/g,'<br />'); 
               
                if(item.infoItem.fileExtensionsItem == ""){
                    photo[0] = "../img/nophoto.png";
                }else{
                    var ext = item.infoItem.fileExtensionsItem.split(';'); 
                    for(var i =0; i<ext.length; i++){
                        if(ext[i] !="") {
                            photo[i] =urlApi+'/itemPhotos/'+item.infoItem.idItem+'/'+i+'.'+ext[i]
                        }
                    }
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
            res.render("erreur.ejs", {
                session: req.session,   
                msgError:"erreur inconnu",
                msgSuccess: ""
            });
        });
        
    });

};
