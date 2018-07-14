module.exports = function(app, urlApi, urlLocal, utils){

    var rp = require("request-promise");

    app.get("/adminDashboard/disputes", function(req, res, next) {
        var msgSuccess ="";
        var msgError="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess =req.query.msgSuccess;
        }
        if(req.query.msgError && req.query.msgError !=""){
            msgError =req.query.msgError;
        }
        if(!req.session.type || req.session.type !=2) {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/dispute/getDisputesFromAdmin",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token
                }
            }).then(function (body) {
                if(body.code == 0){
                    res.render("adminDashboard/adminDashboardDisputes.ejs", {
                        session: req.session,
                        disputes: body.result,
                        msgError: msgError,
                        msgSuccess: msgSuccess
                    });
                }else{
                    res.render("adminDashboard/adminDashboardDisputes.ejs", {
                        session: req.session,
                        disputes: null,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }
            });
        }
    });

    app.get("/adminDashboard/disputeDetails/:id", function(req, res, next) {
        var msgSuccess ="";
        var msgError="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess=req.query.msgSuccess;
        }
        if(req.query.msgError && req.query.msgError !=""){
            msgError=req.query.msgError;
        }
        if(!req.session.type || req.session.type !=2 ) {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/dispute/getDisputeDetailsFromAdmin",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "idDispute" : req.params.id
                }
            }).then(function (body) {
                console.log(body)
                if(body.code == 0){
                    res.render("adminDashboard/adminDashboardDisputeDetail.ejs", {
                        session: req.session,
                        dispute: body.result,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }else{
                    res.render("adminDashboard/adminDashboardDisputeDetail.ejs", {
                        session: req.session,
                        dispute: null,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }
            });
        }
    });
}