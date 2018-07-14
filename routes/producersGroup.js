module.exports = function(app, urlApi, utils, config){

    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/producersGroup/new", function(req, res, next) {
    if(!req.session.type) {
			res.redirect("/");
		}else if(req.session.type !="1"){
            res.redirect("/")
        }else{
            res.render("producerDashboard/producersGroupCreate.ejs", {
                session: req.session,
                group: {},
                msgError:"",
                msgSuccess: ""
            });
        }
    });

    app.post("/producersGroup/new", function(req, res, next) {
        if(!req.session.type) {
          res.redirect("/");
        }else if(req.session.type !="1"){
            res.redirect("/")
        }else{
            var form = new formidable.IncomingForm();
            
            form.parse(req, function (err, fields, files) {
                var msgError ="";
                var newGroup = getGroup(fields);
                var extensionT = files.avatar.name.split('.');
                var extension = extensionT[extensionT.length-1];
                console.log(files)
                if(files.avatar.name !="" && ( files.avatar.size> 5242880  ||  (extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" && extension != "bmp" && extension != "tif" && extension != "tiff"))){
                  msgError += "Le fichier utilisé pour la photo n'est pas conforme : \nExtensions acceptées :  \n\rPoid maximum : 5Mo  ";
                }
                if(!fields.name){
                  msgError += "\nVeuillez saisir le nom de votre coopérative ! ";
                }
                if(!fields.description){
                  msgError += "\nVeuillez saisir la description de votre coopérative ! ";
                }
                if(!fields.location){
                  msgError += "\nVeuillez saisir la localisation de votre coopérative ! ";
                }
                if(!fields.email){
                  msgError += "\nVeuillez saisir un email ! ";
                }
                if(!fields.phone){
                  msgError += "\nVeuillez saisir un numéro de téléphone ! ";
                }
                if(msgError != ""){
                  res.render("producerDashboard/producersGroupCreate.ejs", {
                      session: req.session,
                      group: newGroup,
                      msgError: msgError,
                      msgSuccess: ""
                  });
                }else{
                    rp({
                        url: urlApi + "/producersGroup",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        json: {
                            "token": req.session.token,
                            "loginUser" : req.session.login,
                            "avatar": files.avatar,
                            "name": fields.name,
                            "email": fields.email,
                            "phone": fields.phone,
                            "adress": fields.adress,
                            "city": fields.city,
                            "location": fields.location,
                            "description": fields.description
                        }
                    }).then(function(body) {   
                        if(body.code == 0){
                            var avatar ="";
                            if(files.avatar.name==""){
                                avatar = "../img/picture.png";
                            }else{
                                avatar = config.urlAvatarProducer +"/"+  body.result +"/avatar."+extension;
                            }
                            res.render("producerDashboard/producersGroupCreate.ejs", {
                                session: req.session,
                                group: newGroup,
                                avatar: avatar,
                                msgError:"",
                                msgSuccess: "Votre coopérative a été créée avec succès. Vous pouvez dès maintenant ajouter des membres <a href='/producersGroup/"+body.result+"'>ICI</a>"+ 
                                "<br>Vous pouvez aussi à tout moment gérer vos membres dans l'onglet <strong>Mes coopératives → Consulter mes coopératives</strong>"
                            });
                        }else{
                            res.render("producerDashboard/producersGroupCreate.ejs", {
                                session: req.session,
                                group: newGroup,
                                msgError:"Erreur inconnue "+ body.code +". Merci de réessayer ultérieurement.",
                                msgSuccess: ""
                               
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        res.render("producerDashboard/producersGroupCreate.ejs", {
                            session: req.session,
                            group: newGroup,
                            msgError:"Erreur inconnue 1. Merci de réessayer ultérieurement.",
                            msgSuccess: ""
                        });
                    });

                   
                }            
            });
        }
    });

    app.get('/producersGroup/List', function (req, res, next) {
      var msgError = "";
      var msgSuccess = "";
      var coopAdmin = [];
      var coopMember = [];
      if (!req.session.type) {
        res.redirect("/");
      } else if (req.session.type != "1") {
        res.redirect("/")
      } else {
        rp({
          url: urlApi + "/producersGroup/member/userId/",
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "token": req.session.token,
            "loginUser": req.session.login
          }
        }).then(function (body) {
          if (body.code == 0) {
            coopMember = body.result;
            rp({
              url: urlApi + "/producersGroup/founder/userId/",
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              },
              json: {
                "token": req.session.token,
                "loginUser": req.session.login
              }
            }).then(function (body) {
              console.log(body);
              if (body.code == 0) {
                coopAdmin = body.result;
                res.render("producerDashboard/producersGroupList.ejs", {
                  session: req.session,
                  coopAdmin: coopAdmin,
                  coopMember: coopMember,
                  urlApi: urlApi,
                  msgError: "",
                  msgSuccess: ""
                });
              } else {
                res.render("producerDashboard/producersGroupList.ejs", {
                  msgError: body.message,
                  msgSuccess: msgSuccess,
                  coopAdmin: [],
                  coopMember: [],
                  urlApi: urlApi,
                  session: req.session
                });
              }
            }).catch(function (err) {
              console.log(err);
              res.render("producerDashboard/producersGroupList.ejs", {
                session: req.session,
                coopAdmin: [],
                coopMember: [],
                urlApi: urlApi,
                msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                msgSuccess: ""
              });
            });
          } else {
            res.render("producerDashboard/producersGroupList.ejs", { msgError: body.message, msgSuccess: msgSuccess, coopAdmin: [], coopMember: [],  urlApi: urlApi, session: req.session });
          }
        }).catch(function (err) {
          console.log(err);
          res.render("producerDashboard/producersGroupList.ejs", {
            session: req.session,
            coopAdmin: [],
            coopMember: [],
            urlApi: urlApi,
            msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
            msgSuccess: ""
          });
        });
      }
    });

  app.get('/producersGroup/search/location', function(req, res, next) {
    var listTab= [];
    var coopSubscribed = [];
    var msgError = "";
    if (!req.session.type) {
        res.redirect("/");
    }else{
      rp({
        url: urlApi + "/producersGroup/subscriber/id/",
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        json: {
          "token": req.session.token,
          "loginUser": req.session.login
        }
      }).then(function (body) {
        if (body.code == 0) {
          coopSubscribed = body.result
          if(!req.query.address || !req.query.lat || !req.query.long){
            res.render("producerDashboard/producersGroupSearch.ejs", {
              session: req.session,
              urlApi: urlApi,
              listTab : listTab,
              coopSubscribed : coopSubscribed,
              msgError: "Aucune adresse n'a été selectionnée",
              msgSuccess: ""
            });
          }else{
            rp({
              url: urlApi + "/producersGroup/search",
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              },
              json: {
                "token": req.session.token
              },
              qs: {
                lat : req.query.lat,
                long : req.query.long
              }
            }).then(function (body) {
                if(body.code ==0){
                  console.log(body);
                  listTab = body.result
                  if(listTab.length == 0){
                    msgError = "Aucune coopérative trouvée dans la zone";
                  }
                }else{
                  msgError = "Erreur inconnue 1";
                }
                res.render("producerDashboard/producersGroupSearch.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  listTab : listTab,
                  coopSubscribed : coopSubscribed,
                  msgError: msgError,
                  msgSuccess: ""
                });
              }).catch(function (err) {
                console.log(err);
                res.render("producerDashboard/producersGroupSearch.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  listTab : listTab,
                  coopSubscribed : coopSubscribed,
                  msgError: "Echec de la recherche (erreur inconnue 2)",
                  msgSuccess: ""
                });
              });
          }
        } else {
          res.render("producerDashboard/producersGroupSearch.ejs", {
            session: req.session,
            urlApi: urlApi,
            listTab: listTab,
            coopSubscribed: coopSubscribed,
            msgError: "Une erreur est survenue (erreur inconnue 2)",
            msgSuccess: ""
          });
        }
      }).catch(function (err) {
        console.log(err);
        res.render("producerDashboard/producersGroupSearch.ejs", {
          session: req.session,
          urlApi: urlApi,
          listTab: listTab,
          coopSubscribed: coopSubscribed,
          msgError: "Une erreur est survenue (erreur inconnue 3)",
          msgSuccess: ""
        });
      });
    }
  });

  app.get('/producersGroup/search', function(req, res, next) {
    var listTab = [];
    var coopSubscribed = [];
    if (!req.session.type) {
        res.redirect("/");
    }else{
      rp({
          url: urlApi + "/producersGroup/subscriber/id/",
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "token": req.session.token,
            "loginUser": req.session.login
          }
        }).then(function (body) {
            if(body.code ==0){
              coopSubscribed = body.result
              res.render("producerDashboard/producersGroupSearch.ejs", {
                session: req.session,
                urlApi: urlApi,
                listTab : listTab,
                coopSubscribed : coopSubscribed,
                msgError: "",
                msgSuccess: ""
              });
            }else{
              res.render("producerDashboard/producersGroupSearch.ejs", {
                session: req.session,
                urlApi: urlApi,
                listTab : listTab,
                coopSubscribed : coopSubscribed,
                msgError: "Une erreur est survenue (erreur inconnue 2)",
                msgSuccess: ""
              });
            }
          }).catch(function (err) {
            console.log(err);
            res.render("producerDashboard/producersGroupSearch.ejs", {
              session: req.session,
              urlApi: urlApi,
              listTab : listTab,
              coopSubscribed : coopSubscribed,
              msgError: "Une erreur est survenue (erreur inconnue 3)",
              msgSuccess: ""
            });
          });
    }
  });


  app.get('/producersGroup/:id', function(req, res, next) {
      var msgError = "";
      var msgSuccess = "";
      var coop = {};
      var coopMembers = [];
      if (!req.session.type || !req.params.id) {
        res.redirect("/");
      } else if (req.session.type != "1") {
        res.redirect("/")
      } else {
        rp({
          url: urlApi + "/producersGroupMember/idGroup/",
          method: "GET",
          json: true,
          headers: {
            'User-Agent': 'Request-Promise'
          },
          qs: {
            idGroup: req.params.id,
            token: req.session.token
          }
        }).then(function (body) {
          console.log(body);
          if (body.code == 0) {
            coopMembers = body.result;
            rp({
              url: urlApi + "/producersGroup/idGroup/",
              method: "GET",
              json: true,
              headers: {
                'User-Agent': 'Request-Promise'
              },
              qs: {
                idGroup: req.params.id,
                token: req.session.token
              }
            }).then(function (body) {
              if (body.code == 0) {
                coop = body.result;
                coop.description = coop.description.replace(/\n|\r/g,'<br />'); 
                res.render("producerDashboard/producersGroup.ejs", {
                  session: req.session,
                  coop: coop,
                  coopMembers: coopMembers,
                  urlApi: urlApi,
                  msgError: "",
                  msgSuccess: ""
                });
              } else {
                res.render("producerDashboard/producersGroup.ejs", {
                  msgError: "Erreur inconnue 3. Merci de réessayer ultérieurement.",
                  msgSuccess: msgSuccess,
                  coop: {},
                  coopMembers: [],
                  urlApi: urlApi,
                  session: req.session
                });
              }
            }).catch(function (err) {
              console.log(err);
              res.render("erreur.ejs", {
                session: req.session,
                coop: {},
                coopMembers: [],
                urlApi: urlApi,
                msgError: "Erreur: coopérative non trouvée",
                msgSuccess: ""
              });
            });
          } else {
            console.log("error");
            console.log(body);
            res.render("producerDashboard/producersGroup.ejs", { msgError: msgError, msgSuccess: msgSuccess, coop: {}, coopMembers: [],  urlApi: urlApi, session: req.session });
          }
        }).catch(function (err) {
          console.log(err);
          res.render("producerDashboard/producersGroup.ejs", {
            session: req.session,
            coop: {},
            coopMembers: [],
            urlApi: urlApi,
            msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
            msgSuccess: ""
          });
        });
      }
    });

    app.get('/producersGroupMember/new', function(req, res, next) {
      var authenticate = false;
      var notifId;
      if (!req.session.type || !req.query.idGroup || !req.query.idUser) {
        res.render("erreur.ejs", {
          session: req.session,
          urlApi: urlApi,
          msgError: "Paramètres Manquants.",
          msgSuccess: ""
        });
      } else if (req.session.type != "1") {
        res.render("erreur.ejs", {
          session: req.session,
          urlApi: urlApi,
          msgError: "Vous devez être agriculteur.",
          msgSuccess: ""
        });
      } else {
        rp({
          url: urlApi + "/notification/idUser",
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "token": req.session.token
          }
        }).then(function (body) {
          console.log(body);
          if(body.code==0){
            for(i=0; i<body.result.length; i++){
              if(body.result[i].url != undefined && body.result[i].url == "/producersGroupMember/new?idGroup="+req.query.idGroup+"&idUser="+req.query.idUser){
                authenticate = true;
                notifId = body.result[i].id;
              }
            }
            if(authenticate == true){
              rp({
                url: urlApi + "/producersGroupMember",
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                json: {
                  "token": req.session.token,
                  "idGroup": req.query.idGroup,
                  "idUser": req.query.idUser
                }
              }).then(function (body) {
                if (body.code == 0) {
                  rp({
                    url: urlApi + "/notification/idItem",
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    json: {
                      "id": notifId,
                      "token": req.session.token
                    }
                  }).then(function (body) {
                    console.log(body);
                    if (body.code == "0") {
                      res.redirect("/producersGroup/" + req.query.idGroup);
                    }else{
                      res.render("erreur.ejs", {
                        session: req.session,
                        urlApi: urlApi,
                        msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                        msgSuccess: ""
                      });
                    }
                  }).catch(function (err) {
                    console.log(err);
                    res.render("erreur.ejs", {
                      session: req.session,
                      urlApi: urlApi,
                      msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
                      msgSuccess: ""
                    });
                  });
                } else {
                  res.render("erreur.ejs", {
                    session: req.session,
                    urlApi: urlApi,
                    msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                    msgSuccess: ""
                  });
                }
              }).catch(function (err) {
                console.log(err);
                res.render("erreur.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
                  msgSuccess: ""
                });
              });
            }else{
              res.render("erreur.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  msgError: "Authentification de la notification échouée.",
                  msgSuccess: ""
              });
            }
          }else{
              res.render("erreur.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  msgError: "Erreur inconnue 3. Merci de réessayer ultérieurement.",
                  msgSuccess: ""
              });
        } 
        }).catch(function (err) {
                console.log(err);
                res.render("erreur.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
                  msgSuccess: ""
                });
        });
      }
    });

  app.get('/producersGroupMember/findProducersByDept', function(req, res, next) {
    console.log("filter members");
    if (!req.query.cp) {
        res.send(null);
        console.log("cp");
      } else {
        rp({
          url: urlApi + "/producer/dept",
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "token": req.session.token,
            "cp": req.query.cp
          }
        }).then(function (body) {
          console.log(body);
          if(body.code == 0){
            res.send(body.result);
          }else{
            res.send(null);
          }
        }).catch(function (err) {
          res.send(null);
          console.log("error");
        });
      }
  });
  
  app.post('/producersGroupMember/delete/id', function(req, res, next) {
		if(req.body.id){
			var msgError;
			msgError="";
			rp({
				url: urlApi + "/producersGroupMember/id",
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
        json: {
          "id": req.body.id,
          "token": req.session.token
        }
			}).then(function (body) {
        console.log(body);
				if (body.code == "0") {
					res.send(body);
				} else {
					res.send(null);
				}
			}).catch(function (err) {
				console.log(err);
				res.send(null);
			});
		}else res.send(null);
  });

  app.post('/producersGroup/delete/idGroup', function(req, res, next) {
    console.log(req.body);
		if(req.body.idGroup && req.body.countMembers){
			var msgError;
			msgError="";
      if(req.body.countMembers!='0'){
        console.log("bbb")
        rp({
          url: urlApi + "/producersGroupMember/idGroup",
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "idGroup": req.body.idGroup,
            "token": req.session.token
          }
        }).then(function (body) {
          console.log(body);
          if (body.code == "0") {
            rp({
              url: urlApi + "/producersGroup/idGroup",
              method: "DELETE",
              headers: {
                "Content-Type": "application/json"
              },
              json: {
                "idGroup": req.body.idGroup,
                "token": req.session.token
              }
            }).then(function (body) {
              if (body.code == "0") {
                res.redirect('/producersGroup/List');
              }else {
                res.render("erreur.ejs", {
                  session: req.session,
                  urlApi: urlApi,
                  msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                  msgSuccess: ""
                });
              }
            }).catch(function (err) {
              res.render("erreur.ejs", {
                session: req.session,
                urlApi: urlApi,
                msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
                msgSuccess: ""
              });
            });
          } else {
            res.render("erreur.ejs", {
              session: req.session,
              urlApi: urlApi,
              msgError: "Erreur inconnue 3. Merci de réessayer ultérieurement.",
              msgSuccess: ""
            });
          }
        }).catch(function (err) {
          res.render("erreur.ejs", {
            session: req.session,
            urlApi: urlApi,
            msgError: "Erreur inconnue 4. Merci de réessayer ultérieurement.",
            msgSuccess: ""
          });
        });
      }else{
        console.log("aaaa");
        rp({
          url: urlApi + "/producersGroup/idGroup",
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          json: {
            "idGroup": req.body.idGroup,
            "token": req.session.token
          }
        }).then(function (body) {
          console.log(body);
          if (body.code == "0") {
            res.redirect('/producersGroup/List');
          } else {
            res.render("erreur.ejs", {
              session: req.session,
              urlApi: urlApi,
              msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
              msgSuccess: ""
            });
          }
        }).catch(function (err) {
          res.render("erreur.ejs", {
            session: req.session,
            urlApi: urlApi,
            msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
            msgSuccess: ""
          });
        });
      }
		}else{
      res.render("erreur.ejs", {
        session: req.session,
        urlApi: urlApi,
        msgError: "Erreur inconnue 5. Merci de réessayer ultérieurement.",
        msgSuccess: ""
      });
    }
  });

    function getGroup(fields){
        var producer = {
          avatar: "",
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          adress: fields.adress,
          city: fields.city,
          location: fields.location,
          description: fields.description
        };
        return producer;
    }

}