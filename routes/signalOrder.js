module.exports = function(app, urlApi, utils, config) {

    var rp = require("request-promise");

    app.get("/signalOrder/:id", function(req, res, next) {
        if(!req.session.type || !req.params.id || req.params.id =="") {
            console.log("in")
			res.redirect("/");
        }else{
            var motifs;
            rp({
                url: urlApi + "/motif",
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
                            msgError:"",
                            msgSuccess: "",
                            items: body.result,
                            motifs: motifs
                        });
                    }else{
                        res.redirect("/");
                    }
                }).catch(function(err){
                    //console.log(err)
                    res.redirect("/");
                })            
            }).catch(function(err){
                //console.log(err)
                res.redirect("/");
            })
        }
    });


}