module.exports = function(app, urlApi, utils, config){
  var rp = require("request-promise");
 
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.post('/notification/userId', function(req, res, next) {
		if(req.body.idUser && req.body.title && req.body.description && req.body.url && req.body.type){
			var msgError;
			msgError="";
			rp({
				url: urlApi + "/notification/idUser",
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
        json: {
          "idUser": req.body.idUser,
          "title": req.body.title,
          "description": req.body.description,
          "url": req.body.url,
          "type": req.body.type,
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


	app.get('/notification/userLogin', function(req, res, next) {
		if(req.query.userLogin){
			var msgError;
			msgError="";
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
  app.post('/notification/delete/idNotif', function(req, res, next) {
		console.log(req.body);
		if(req.body.id){
			var msgError;
			msgError="";
			rp({
				url: urlApi + "/notification/idItem",
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				},
        json: {
					"id": req.body.id,
          "token": req.session.token
        }
			}).then(function (body) {
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
  
};