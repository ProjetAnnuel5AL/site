module.exports = function(app, urlApi){
  
 
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	
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
				if (JSON.parse(body).code == "0") {
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