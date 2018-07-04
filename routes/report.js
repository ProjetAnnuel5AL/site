module.exports = function(app, urlApi, utils, config) {

    var rp = require("request-promise");

    app.get("/report/item", function(req, res, next) {
        
		rp({
			uri: urlApi + "/motif/item",
			method: "GET",
			json: true,
			headers: {
			    'User-Agent': 'Request-Promise'
			}
		}).then(function (body) {  
			if (body.code == "0") {
				res.send(body.result);
			} else {
				res.send(null);
			}
		}).catch(function(err){
			res.send(null);
		})

	});
	
	app.post("/report/item", function(req, res, next) {
		
		if(req.body.idMotif && req.body.idItem){
			rp({
				uri: urlApi + "/report/item",
				method: "POST",
				json: true,
				headers: {
					'User-Agent': 'Request-Promise'
				},
				json: {
					'idMotif': req.body.idMotif,
					'idItem': req.body.idItem
				}
			}).then(function (body) {  
				
				res.send({"code": body.code});
					
			}).catch(function(err){
				res.send({"code":3});
			})
		}else{
			res.send({"code":1});
		}
		

    });

    app.get("/report/producer", function(req, res, next) {
		rp({
			uri: urlApi + "/motif/producer",
			method: "GET",
			json: true,
			headers: {
			    'User-Agent': 'Request-Promise'
			}
		}).then(function (body) {  
			if (body.code == "0") {
				res.send(body.result);
			} else {
				res.send(null);
			}
		}).catch(function(err){
			res.send(null);
		})
	});
	


	app.post("/report/producer", function(req, res, next) {
		
		if(req.body.idMotif && req.body.idProducer){
			rp({
				uri: urlApi + "/report/producer",
				method: "POST",
				json: true,
				headers: {
					'User-Agent': 'Request-Promise'
				},
				json: {
					'idMotif': req.body.idMotif,
					'idProducer': req.body.idProducer
				}
			}).then(function (body) {  
				
				res.send({"code": body.code});
					
			}).catch(function(err){
				res.send({"code":3});
			})
		}else{
			res.send({"code":1});
		}
		

    });


    app.get("/report/producerGroup", function(req, res, next) {
		rp({
			uri: urlApi + "/motif/producerGroup",
			method: "GET",
			json: true,
			headers: {
			    'User-Agent': 'Request-Promise'
			}
		}).then(function (body) {  		
			if (body.code == "0") {
				res.send(body.result);
			} else {
				res.send(null);
			}
		}).catch(function(err){
			res.send(null);
		})
	});
	
	app.post("/report/producerGroup", function(req, res, next) {
		
		if(req.body.idMotif && req.body.idProducerGroup){
			rp({
				uri: urlApi + "/report/producerGroup",
				method: "POST",
				json: true,
				headers: {
					'User-Agent': 'Request-Promise'
				},
				json: {
					'idMotif': req.body.idMotif,
					'idProducerGroup': req.body.idProducerGroup
				}
			}).then(function (body) {  
				
				res.send({"code": body.code});
					
			}).catch(function(err){
				res.send({"code":3});
			})
		}else{
			res.send({"code":1});
		}
		

    });
}