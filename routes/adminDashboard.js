module.exports = function(app, urlApi, urlLocal, utils){

    var rp = require("request-promise");
    var fs = require('fs');

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

    app.post("/adminDashboard/disputeDetails/:id", function(req, res, next) {
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
        
            if(req.body.winner && req.params.id && req.body.description) {

                rp({
                    url: urlApi + "/dispute/arbitrage",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "idDispute" : req.params.id,
                        "winner" : req.body.winner,
                        "description" : req.body.description
                    }
                }).then(function (body) {
                    
                    if(body.code == 0){
                       res.redirect("/adminDashboard/disputes?msgSuccess=Arbitrage effectué.");
                    }else{
                        res.redirect("/adminDashboard/disputes?msgError=Erreur lors de l'arbitrage.");
                    }
                });
            }else{
                res.redirect("/");
            }
            
        }
    });

    app.get("/adminDashboard/payementTodo", function(req, res, next){
        var msgError="";
        var msgSuccess="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess=req.query.msgSuccess;
        }
        if(!req.session.type || req.session.type !=2 ) {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/getPaymentToDo",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                }
            }).then(function (body) {
                if(body.code == 0){

                    res.render("adminDashboard/adminDashboardPayementTodo.ejs", {
                        session: req.session,
                        payement: body.result,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });

                }else{

                    res.render("adminDashboard/adminDashboardPayementTodo.ejs", {
                        session: req.session,
                        payement: null,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });

                }
            });
        }
    });
    

    app.post("/adminDashboard/payementTodo", function(req, res, next){ 
        var msgError="";
        var msgSuccess="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess=req.query.msgSuccess;
        }
        if(!req.session.type || req.session.type !=2 ) {
            res.redirect("/");
        }else{ 
            //console.log(req.body.pay)
            if(req.body.pay){ 
                rp({
                    url: urlApi + "/getPaymentToDoDetails",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "transac" : req.body.pay
                    }
                }).then(function (body) { 
                    //console.log(body)
                    if(body.code == 0 ){

                        res.render("adminDashboard/adminDashboardPayementValidate.ejs", {
                            session: req.session,
                            payement: body.result,
                            msgError:msgError,
                            msgSuccess: msgSuccess
                        });

                    }else{
                        res.redirect("/adminDashboard/payementTodo");
                    }
                    

                }).catch(function(err){
                    //console.log(err)
                    res.redirect("/adminDashboard/payementTodo");
                });  
            }else{
                //console.log("in")
                res.redirect("/adminDashboard/payementTodo");
            }
        } 
    });

    app.post("/adminDashboard/payementTodoValidate", function(req, res, next){ 
        var msgError="";
        var msgSuccess="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess=req.query.msgSuccess;
        }
        if(!req.session.type || req.session.type !=2 ) {
            res.redirect("/");
        }else{ 
           
            if(req.body.pay){ 
                rp({
                    url: urlApi + "/getPaymentToDoDetails",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "transac" : req.body.pay
                    }
                }).then(function (body) { 
                    
                    if(body.code == 0 ){
                            
                        res.render("adminDashboard/adminDashboardPayementValidate.ejs", {
                            session: req.session,
                            payement: body.result,
                            msgError:msgError,
                            msgSuccess: msgSuccess
                        });

                    }else{
                        res.redirect("/adminDashboard/payementTodo");
                    }
                    

                }).catch(function(err){
                    res.redirect("/adminDashboard/payementTodo");
                });

                
            }else{

                res.redirect("/adminDashboard/payementTodo");
            }
        } 
    });

    app.post("/adminDashboard/payementTodoSaveValidate", function(req, res, next){ 
        var msgError="";
        var msgSuccess="";
        if(!req.session.type || req.session.type !=2 ) {
            res.redirect("/");
        }else{ 
            if(req.body.pay){ 
                rp({
                    url: urlApi + "/getPaymentToDoToSuccessDetails",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "transac" : req.body.pay
                    }
                }).then(function (body) { 
                   
                    if(body.code == 0 ){
                        
                        res.redirect("/adminDashboard/payementTodo?msgSuccess=Transaction enregistrée.");
                    }else{
                        res.redirect("/adminDashboard/payementTodo");
                    }
                }).catch(function(err){
                   
                    res.redirect("/adminDashboard/payementTodo");
                });

                
            }else{
           
                res.redirect("/adminDashboard/payementTodo");
            }
        } 
    });

    app.get("/adminDashboard/getIban/:id", function(req, res, next){
        if(!req.session.type || req.session.type !=2 ) {

            res.render("close.ejs");
        }else{ 
            if(req.params.id){

                //ask decrypt return url
                rp({
                    url: urlApi + "/getIban",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        "loginUser": req.session.login,
                        "token" : req.session.token,
                        "idProducer" : req.params.id
                    }
                }).then(function (body) { 
                    
                    if(body.result){
                        var file;
                        var http = require('http');
                        var uuidv4 = require('uuid/v4');
                        var namefilePdf=  uuidv4()+".pdf";
                        fs.writeFile('ressources/pdf/'+namefilePdf, null, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            file = fs.createWriteStream("ressources/pdf/"+namefilePdf);
                            //console.log('Saved!');
                        });

                         
                        var pathStr="";
                        var path = body.result.split('/');
                        for (var i = 1; i<path.length; i++){
                            pathStr += "/" + path[i];
                        }
                       
                        var request = http.get(urlApi+pathStr, function(response) {
                            response.pipe(file);
                            response.on('end', function () {
                                    var fullpath = process.cwd() + "/ressources/pdf/"+namefilePdf;
                                    res.sendFile(fullpath);
                                    
                                    rp({
                                        url: urlApi + "/deleteIbanCrypt",
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        json: {
                                            "loginUser": req.session.login,
                                            "token" : req.session.token,
                                            "idProducer" : req.params.id
                                        }
                                    }).then(function (body) { 
                                        setTimeout(function(){
                                           fs.unlink("ressources/pdf/"+namefilePdf);
                                        }, 5000);
                                    }).catch(function (err){
                                        //res.render("close.ejs");
                                    });
                                
                            });
                          });          
                    }else{
                        res.render("close.ejs");
                    }
                }).catch(function(err){      
                    res.render("close.ejs");
                });
            }else{
                res.render("close.ejs");
            }
        }
    });


    app.get("/adminDashboard/payementRefund", function(req, res, next){
        var msgError="";
        var msgSuccess="";
        if(req.query.msgSuccess && req.query.msgSuccess !=""){
            msgSuccess=req.query.msgSuccess;
        }
        if(!req.session.type || req.session.type !=2 ) {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/getPaymentRefund",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                }
            }).then(function (body) {
                if(body.code == 0){
                    res.render("adminDashboard/adminDashboardPayementRefund.ejs", {
                        session: req.session,
                        payement: body.result,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }else{
                    res.render("adminDashboard/adminDashboardPayementRefund.ejs", {
                        session: req.session,
                        payement: null,
                        msgError:msgError,
                        msgSuccess: msgSuccess
                    });
                }
            });
        }
    });

    app.get("/adminDashboard/validateRefund/:id", function(req, res, next){
        if(!req.session.type || req.session.type !=2 || !req.params.id) {
            res.redirect("/");
        }else{
            rp({
                url: urlApi + "/paymentRefundToSucces",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                json: {
                    "loginUser": req.session.login,
                    "token" : req.session.token,
                    "transac": req.params.id
                }
            }).then(function (body) {
                if(body.code == 0){
                    res.redirect("/adminDashboard/payementRefund?msgSuccess=Remboursement enregistré.");
                }else{
                    res.redirect("/adminDashboard/payementRefund");
                }
            });
        }
    });




};