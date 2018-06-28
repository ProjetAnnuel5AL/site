module.exports = function(app, urlApi){
  

	app.get('/product/getByCategoryId', function(req, res, next) {
    	var rp = require("request-promise");
		if(req.query.id){
			var msgError;
			msgError="";
			rp({
				url: urlApi + "/products/findByCategoryId?id="+req.query.id,
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			}).then(function (body) {
				var jsonResult = JSON.parse(body)
				if (jsonResult.code == "0") {
					res.send(jsonResult);
				} else {
					res.send(null);
				}
			}).catch(function (err) {
				
				res.send(null);
			});
		}else res.send(null);
  });

  app.get('/product', function(req, res, next) {
	 
		var rp = require("request-promise");
		rp({
			uri: urlApi + "/products",
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
    
};