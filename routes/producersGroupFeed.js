module.exports = function(app, urlApi, utils, config){
    var rp = require("request-promise");
    var formidable = require("formidable");
    var fs = require('fs');

    app.get("/producersGroupEvent/new/:id", function(req, res, next) {
    if(!req.session.type) {
			res.redirect("/");
		}else if(req.session.type !="1"){
            res.redirect("/")
        }else{
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
                res.render("producerDashboard/producersGroupEventCreate.ejs", {
                    idGroup: req.params.id,
                    founderLogin: body.result.loginUser,
                    session: req.session,
                    event: {},
                    msgError:"",
                    msgSuccess: ""
                });
              }else{
                res.render("producerDashboard/producersGroupEventCreate.ejs", {
                  idGroup: 0,
                  founderLogin: "",
                  session: req.session,
                  event: {},
                  msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement. ",
                  msgSuccess: ""
                });
              }
              }).catch(function (err) {
                console.log(err);
                res.render("producerDashboard/producersGroupEventCreate.ejs", {
                  idGroup: 0,
                  founderLogin: "",
                  session: req.session,
                  event: {},
                  msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement. ",
                  msgSuccess: ""
                });
              });
        }
    });
    app.get('/producersGroupEvent/:id', function(req, res, next) {
      var msgError = "";
      var msgSuccess = "";
      var coop = {};
      var isSubcribed = false;
      var memberOrAdmin = false;
      var coopMembers = [];
      var coopEvent = {};
      var coopParticipants= [];
      if (!req.session.type || !req.params.id) {
        res.redirect("/");
      } else {
        rp({
          url: urlApi + "/producersGroupEvent/id/",
          method: "GET",
          json: true,
          headers: {
            'User-Agent': 'Request-Promise'
          },
          qs: {
            idEvent: req.params.id,
            token: req.session.token
          }
          
        }).then(function (body) {
          console.log(body);
          if (body.code == 0) {
            coopEvent = body.result[0];
            rp({
              url: urlApi + "/producersGroupMember/idGroup/",
              method: "GET",
              json: true,
              headers: {
                'User-Agent': 'Request-Promise'
              },
              qs: {
                idGroup: coopEvent.idGroup,
                token: req.session.token
              }
            }).then(function (body) {
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
                    idGroup: coopEvent.idGroup,
                    token: req.session.token
                  }
                }).then(function (body) {
                  if (body.code == 0) {
                    coop = body.result;
                    if(coop.loginUser == req.session.login){
                      memberOrAdmin = true;
                    }else {
                      for(i=0; i<coopMembers.length; i++){
                        if(coopMembers[i].loginUser == req.session.login){
                          memberOrAdmin = true;
                        }
                      }
                    }
                    coop.description = coop.description.replace(/\n|\r/g,'<br />'); 
                    rp({
                      url: urlApi + "/producersGroupSubscriber/idUser/idGroup",
                      method: "GET",
                      json: true,
                      headers: {
                        'User-Agent': 'Request-Promise'
                      },
                      qs: {
                        idGroup: coopEvent.idGroup,
                        token: req.session.token
                      }
                    }).then(function (body) {
                      console.log(body);
                      if (body.code == 0) {
                        if (body.code == 0 && body.result.length > 0 || memberOrAdmin) {
                          isSubcribed = true;
                          rp({
                            url: urlApi + "/producersGroupEventParticipant/producer/idEvent/",
                            method: "GET",
                            json: true,
                            headers: {
                              'User-Agent': 'Request-Promise'
                            },
                            qs: {
                              idEvent: req.params.id,
                              token: req.session.token
                            }
                          }).then(function (body) {
                            console.log(body);
                            if(body.code == 0){
                              coopParticipants = body.result
                              res.render("producerDashboard/producersGroupEvent.ejs", {
                                session: req.session,
                                coop: coop,
                                coopEvent: coopEvent,
                                coopParticipants: coopParticipants,
                                isSubcribed: isSubcribed,
                                memberOrAdmin: memberOrAdmin,
                                coopMembers: coopMembers,
                                urlApi: urlApi,
                                msgError: "",
                                msgSuccess: ""
                              });
                            }else{
                              res.render("producerDashboard/producersGroupEvent.ejs", {
                                msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                                msgSuccess: msgSuccess,
                                coop: {},
                                coopEvent: coopEvent,
                                coopParticipants: coopParticipants,
                                isSubcribed: isSubcribed,
                                memberOrAdmin: memberOrAdmin,
                                coopMembers: [],
                                urlApi: urlApi,
                                session: req.session
                              });
                            }
                          }).catch(function (err) {
                            console.log(err);
                            res.render("producerDashboard/producersGroupEvent.ejs", {
                              session: req.session,
                              coop: {},
                              coopEvent: coopEvent,
                              coopParticipants: coopParticipants,
                              isSubcribed: isSubcribed,
                              memberOrAdmin: memberOrAdmin,
                              coopMembers: [],
                              urlApi: urlApi,
                              msgError: "Erreur: coopérative non trouvée",
                              msgSuccess: ""
                            });
                          });
                        }else{
                          res.redirect("/");
                        }
                      } else {
                        res.render("producerDashboard/producersGroupEvent.ejs", {
                          msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
                          msgSuccess: msgSuccess,
                          coop: {},
                          coopEvent: coopEvent,
                          coopParticipants: coopParticipants,
                          isSubcribed: isSubcribed,
                          memberOrAdmin: memberOrAdmin,
                          coopMembers: [],
                          urlApi: urlApi,
                          session: req.session
                        });
                      }
                    }).catch(function (err) {
                        console.log(err);
                        res.render("producerDashboard/producersGroupEvent.ejs", {
                          session: req.session,
                          coop: {},
                          coopEvent: coopEvent,
                          coopParticipants: coopParticipants,
                          isSubcribed: isSubcribed,
                          memberOrAdmin: memberOrAdmin,
                          coopMembers: [],
                          urlApi: urlApi,
                          msgError: "Erreur: coopérative non trouvée",
                          msgSuccess: ""
                        });
                      });
                  } else {
                    res.render("producerDashboard/producersGroupEvent.ejs", {
                      msgError: "Erreur inconnue 3. Merci de réessayer ultérieurement.",
                      msgSuccess: msgSuccess,
                      coop: {},
                      coopEvent: coopEvent,
                      coopParticipants: coopParticipants,
                      isSubcribed: isSubcribed,
                      memberOrAdmin: memberOrAdmin,
                      coopMembers: [],
                      urlApi: urlApi,
                      session: req.session
                    });
                  }
                }).catch(function (err) {
                  console.log(err);
                  res.render("producerDashboard/producersGroupEvent.ejs", {
                    session: req.session,
                    coop: {},
                    coopEvent: coopEvent,
                    coopParticipants: coopParticipants,
                    isSubcribed: isSubcribed,
                    memberOrAdmin: memberOrAdmin,
                    coopMembers: [],
                    urlApi: urlApi,
                    msgError: "Erreur: coopérative non trouvée",
                    msgSuccess: ""
                  });
                });
              } else {
              console.log("error");
              console.log(body);
              res.render("producerDashboard/producersGroupEvent.ejs", { msgError: msgError, msgSuccess: msgSuccess, coop: {}, coopEvent: coopEvent, coopParticipants: coopParticipants, isSubcribed: isSubcribed, memberOrAdmin: memberOrAdmin, coopMembers: [],  urlApi: urlApi, session: req.session });
            }
            }).catch(function (err) {
              console.log(err);
              res.render("producerDashboard/producersGroupEvent.ejs", {
                session: req.session,
                coop: {},
                coopEvent: coopEvent,
                coopParticipants: coopParticipants,
                isSubcribed: isSubcribed,
                memberOrAdmin: memberOrAdmin,
                coopMembers: [],
                urlApi: urlApi,
                msgError: "Erreur: coopérative non trouvée",
                msgSuccess: ""
              });
            });
          } else {
            console.log("error");
            console.log(body);
            res.render("producerDashboard/producersGroupEvent.ejs", { msgError: msgError, msgSuccess: msgSuccess, coop: {}, coopEvent: coopEvent, coopParticipants: coopParticipants, isSubcribed: isSubcribed, memberOrAdmin: memberOrAdmin, coopMembers: [],  urlApi: urlApi, session: req.session });
          }
        }).catch(function (err) {
          console.log(err);
          res.render("producerDashboard/producersGroupEvent.ejs", {
            session: req.session,
            coop: {},
            coopEvent: coopEvent,
            coopParticipants: coopParticipants,
            isSubcribed: isSubcribed,
            coopMembers: [],
            urlApi: urlApi,
            msgError: "Erreur inconnue 4. Merci de réessayer ultérieurement.",
            msgSuccess: ""
          });
        });
      }
    });

    app.get('/producersGroupFeed/:id', function(req, res, next) {
      var msgError = "";
      var msgSuccess = "";
      var coop = {};
      var isSubcribed = false;
      var memberOrAdmin = false;
      var coopMembers = [];
      var coopEvents = [];
      if (!req.session.type || !req.params.id) {
        res.redirect("/");
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
              url: urlApi + "/producersGroupSubscriber/idUser/idGroup",
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
              if (body.code == 0 && body.result.length > 0) {
                isSubcribed = true;
              }
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
                  if(coop.loginUser == req.session.login){
                    memberOrAdmin = true;
                  }else {
                    for(i=0; i<coopMembers.length; i++){
                      if(coopMembers[i].loginUser == req.session.login){
                        memberOrAdmin = true;
                      }
                    }
                  }
                  rp({
                    url: urlApi + "/producersGroupEvent/idGroup/",
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
                      coopEvents = body.result;
                      coop.description = coop.description.replace(/\n|\r/g,'<br />'); 
                      res.render("producerDashboard/producersGroupFeed.ejs", {
                        session: req.session,
                        coop: coop,
                        coopEvents: coopEvents,
                        isSubcribed: isSubcribed,
                        memberOrAdmin: memberOrAdmin,
                        coopMembers: coopMembers,
                        urlApi: urlApi,
                        msgError: "",
                        msgSuccess: ""
                      });
                    } else {
                      res.render("producerDashboard/producersGroupFeed.ejs", {
                        msgError: "Erreur inconnue 3. Merci de réessayer ultérieurement.",
                        msgSuccess: msgSuccess,
                        coop: {},
                        coopEvents: coopEvents,
                        isSubcribed: isSubcribed,
                        memberOrAdmin: memberOrAdmin,
                        coopMembers: [],
                        urlApi: urlApi,
                        session: req.session
                      });
                    }
                  }).catch(function (err) {
                      console.log(err);
                      res.render("producerDashboard/producersGroupFeed.ejs", {
                        session: req.session,
                        coop: {},
                        coopEvents: coopEvents,
                        isSubcribed: isSubcribed,
                        memberOrAdmin: memberOrAdmin,
                        coopMembers: [],
                        urlApi: urlApi,
                        msgError: "Erreur: coopérative non trouvée",
                        msgSuccess: ""
                      });
                    });
                } else {
                  res.render("producerDashboard/producersGroupFeed.ejs", {
                    msgError: "Erreur inconnue 3. Merci de réessayer ultérieurement.",
                    msgSuccess: msgSuccess,
                    coop: {},
                    coopEvents: coopEvents,
                    isSubcribed: isSubcribed,
                    memberOrAdmin: memberOrAdmin,
                    coopMembers: [],
                    urlApi: urlApi,
                    session: req.session
                  });
                }
              }).catch(function (err) {
                console.log(err);
                res.render("producerDashboard/producersGroupFeed.ejs", {
                  session: req.session,
                  coop: {},
                  coopEvents: coopEvents,
                  isSubcribed: isSubcribed,
                  memberOrAdmin: memberOrAdmin,
                  coopMembers: [],
                  urlApi: urlApi,
                  msgError: "Erreur: coopérative non trouvée",
                  msgSuccess: ""
                });
              });
            }).catch(function (err) {
              console.log(err);
              res.render("producerDashboard/producersGroupFeed.ejs", {
                session: req.session,
                coop: {},
                coopEvents: coopEvents,
                isSubcribed: isSubcribed,
                memberOrAdmin: memberOrAdmin,
                coopMembers: [],
                urlApi: urlApi,
                msgError: "Erreur: coopérative non trouvée",
                msgSuccess: ""
              });
            });
          } else {
            console.log("error");
            console.log(body);
            res.render("producerDashboard/producersGroupFeed.ejs", { msgError: msgError, msgSuccess: msgSuccess, coop: {}, coopEvents: coopEvents, isSubcribed: isSubcribed, memberOrAdmin: memberOrAdmin, coopMembers: [],  urlApi: urlApi, session: req.session });
          }
        }).catch(function (err) {
          console.log(err);
          res.render("producerDashboard/producersGroupFeed.ejs", {
            session: req.session,
            coop: {},
            coopEvents: coopEvents,
            isSubcribed: isSubcribed,
            coopMembers: [],
            urlApi: urlApi,
            msgError: "Erreur inconnue 2. Merci de réessayer ultérieurement.",
            msgSuccess: ""
          });
        });
      }
    });
    app.post('/producersGroupFeed/subscribe/idGroup', function(req, res, next) {
      console.log("subscribe");
      if(req.body.idGroup){
        var msgError;
        msgError="";
        rp({
          url: urlApi + "/producersGroupSubscriber",
          method: "POST",
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
    app.post('/producersGroupFeed/unsubscribe/idGroup', function(req, res, next) {
      if(req.body.idGroup){
        var msgError;
        msgError="";
        rp({
          url: urlApi + "/producersGroupSubscriber/idUser/idGroup",
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
    app.post('/producersGroupEvent/new', function (req, res, next) {
      var idGroup;
      var founderLogin;
      if (!req.session.type) {
        res.redirect("/");
      } else if (req.session.type != "1") {
        res.redirect("/")
      } else {
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {
          var msgError = "";
          var coopMembers = [];
          var coopSubscriber = [];
          var newEvent = getEvent(fields);
          idGroup = fields.idGroup;
          founderLogin = fields.founderLogin;
          if (!fields.name) {
            msgError += "\nVeuillez saisir le nom de votre événement ! ";
          }
          if (!fields.description) {
            msgError += "\nVeuillez saisir la description de votre événement ! ";
          }
          if (!fields.location) {
            msgError += "\nVeuillez saisir la localisation de votre événement ! ";
          }
          if (!fields.date) {
            msgError += "\nVeuillez saisir la date de votre événement ! ";
          }
          if (!fields.founderLogin || fields.founderLogin != req.session.login) {
            msgError += "\nVous n'êtes pas l'administrateur de cette coopérative ! ";
          }
          if (msgError != "") {
            res.render("producerDashboard/producersGroupEventCreate.ejs", {
              session: req.session,
              idGroup: idGroup,
              founderLogin: founderLogin,
              event: newEvent,
              msgError: msgError,
              msgSuccess: ""
            });
          } else {
            rp({
              url: urlApi + "/producersGroupEvent",
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              json: {
                "token": req.session.token,
                "idGroup": fields.idGroup,
                "name": fields.name,
                "adress": fields.adress,
                "city": fields.city,
                "location": fields.location,
                "description": fields.description,
                "date": fields.date
              }
            }).then(function (body) {
              console.log(body);
              if (body.code == 0) {
                var eventId = body.result;
                rp({
                  url: urlApi + "/producersGroupMember/idGroup/",
                  method: "GET",
                  json: true,
                  headers: {
                    'User-Agent': 'Request-Promise'
                  },
                  qs: {
                    idGroup: idGroup,
                    token: req.session.token
                  }
                }).then(function (body) {
                  console.log(body);
                  if (body.code == 0) {
                    coopMembers = body.result;
                    rp({
                      url: urlApi + "/producersGroupSubscriber/idGroup",
                      method: "GET",
                      json: true,
                      headers: {
                        'User-Agent': 'Request-Promise'
                      },
                      qs: {
                        idGroup: idGroup,
                        token: req.session.token
                      }
                    }).then(function (body) {
                      if (body.code == 0) {
                        coopSubscriber = body.result;
                        var notifGroup = [];
                        for (i = 0; i < coopMembers.length; i++) {
                          var notif = {};
                          notif.idUser = coopMembers[i].idUserProducer;
                          notif.title = "Invitation à un événement";
                          notif.description = "Vous êtes conviés à participer à l'événement " + fields.name + " le " + fields.date + ". Consulter l'événement?";
                          notif.url = "/producersGroupEvent/" + eventId;
                          notif.type = "choice";
                          notifGroup[i] = notif;
                        }
                        for (i = 0; i < coopSubscriber.length; i++) {
                          var notif = {};
                          notif.idUser = coopSubscriber[i].idUser;
                          notif.title = "Un nouvel événement est planifié";
                          notif.description = "L'événement " + fields.name + " est organisé le " + fields.date + ". Consulter l'événement ?";
                          notif.url = "/producersGroupEvent/" + eventId;
                          notif.type = "choice";
                          notifGroup[i + coopMembers.length] = notif;
                        }
                        rp({
                          url: urlApi + "/notification/multiple",
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          json: {
                            "notifGroup": notifGroup,
                            "token": req.session.token
                          }
                        }).then(function (body) {
                          if (body.code == 0) {
                            res.render("producerDashboard/producersGroupEventCreate.ejs", {
                              session: req.session,
                              idGroup: idGroup,
                              founderLogin: founderLogin,
                              event: newEvent,
                              msgError: "",
                              msgSuccess: "Votre événement a été créée avec succès. Vous pouvez dès maintenant le consulter <a href='/producersGroupEvent/" + eventId + "'>ICI</a>" +
                              "<br>Vous pouvez aussi à tout moment suivre votre événement dans l'onglet <strong>Mes coopératives → Consulter mes coopératives</strong>"
                            });
                          } else {
                            res.render("producerDashboard/producersGroupEventCreate.ejs", {
                              session: req.session,
                              idGroup: idGroup,
                              founderLogin: founderLogin,
                              event: newEvent,
                              msgError: "Erreur inconnue " + body.code + ". Merci de réessayer ultérieurement.",
                              msgSuccess: ""

                            });
                          }
                        }).catch(function (err) {
                          console.log(err);
                          res.render("producerDashboard/producersGroupEventCreate.ejs", {
                            session: req.session,
                            idGroup: idGroup,
                            founderLogin: founderLogin,
                            event: newEvent,
                            msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                            msgSuccess: ""
                          });
                        });
                      } else {
                        res.render("producerDashboard/producersGroupEventCreate.ejs", {
                          session: req.session,
                          idGroup: idGroup,
                          founderLogin: founderLogin,
                          event: newEvent,
                          msgError: "Erreur inconnue " + body.code + ". Merci de réessayer ultérieurement.",
                          msgSuccess: ""

                        });
                      }
                    }).catch(function (err) {
                      console.log(err);
                      res.render("producerDashboard/producersGroupEventCreate.ejs", {
                        session: req.session,
                        idGroup: idGroup,
                        founderLogin: founderLogin,
                        event: newEvent,
                        msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                        msgSuccess: ""
                      });
                    });
                  } else {
                    res.render("producerDashboard/producersGroupEventCreate.ejs", {
                      session: req.session,
                      idGroup: idGroup,
                      founderLogin: founderLogin,
                      event: newEvent,
                      msgError: "Erreur inconnue " + body.code + ". Merci de réessayer ultérieurement.",
                      msgSuccess: ""

                    });
                  }
                }).catch(function (err) {
                  console.log(err);
                  res.render("producerDashboard/producersGroupEventCreate.ejs", {
                    session: req.session,
                    idGroup: idGroup,
                    founderLogin: founderLogin,
                    event: newEvent,
                    msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                    msgSuccess: ""
                  });
                });
              } else {
                res.render("producerDashboard/producersGroupEventCreate.ejs", {
                  session: req.session,
                  idGroup: idGroup,
                  founderLogin: founderLogin,
                  event: newEvent,
                  msgError: "Erreur inconnue " + body.code + ". Merci de réessayer ultérieurement.",
                  msgSuccess: ""

                });
              }
            }).catch(function (err) {
              console.log(err);
              res.render("producerDashboard/producersGroupEventCreate.ejs", {
                session: req.session,
                idGroup: idGroup,
                founderLogin: founderLogin,
                event: newEvent,
                msgError: "Erreur inconnue 1. Merci de réessayer ultérieurement.",
                msgSuccess: ""
              });
            });
          }
        });
      }
    });

  app.post('/producersGroupEventParticipant/new', function(req, res, next) {
		if(req.body.idGroup && req.body.idEvent && req.body.typeParticipant && req.body.libelleParticipant){
			var msgError;
			msgError="";
			rp({
				url: urlApi + "/producersGroupEventParticipant",
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
        json: {
          "idEvent": req.body.idEvent,
          "idGroup": req.body.idGroup,
          "typeParticipant": req.body.typeParticipant ,
          "libelleParticipant": req.body.libelleParticipant,
          "token": req.session.token
        }
			}).then(function (body) {
				if (body.code == 0) {
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

    function getEvent(fields){
        var event = {
          name: fields.name,
          adress: fields.adress,
          city: fields.city,
          location: fields.location,
          description: fields.description,
          date: fields.date
        };
        return event;
    }
}