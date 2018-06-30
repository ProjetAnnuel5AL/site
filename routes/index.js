module.exports = function(app, urlApi, urlLocal, utils ,config) {

	//FRONT
	require("./home")(app, urlApi);
	require("./visualisationAnnonce")(app, urlApi, utils, config);
	//require("./item")(app, urlApi, utils);
	require("./itemList")(app, urlApi, utils);
	require("./registration")(app, urlApi, urlLocal, utils);
	require("./login")(app, urlApi, urlLocal, utils);
	require("./registrationValidation")(app, urlApi, urlLocal, utils);
	require("./logout")(app);
	require("./userDashboard")(app, urlApi, urlLocal, utils);
	require("./producerDashboard")(app, urlApi, urlLocal, utils, config);
	require("./becomeProducer")(app, urlApi, utils, config, urlLocal);
	require("./ficheProducer")(app, urlApi, utils, config);
	require("./product")(app, urlApi);
	require("./cart")(app, urlApi, utils, config);
	require("./producersGroup")(app, urlApi, utils, config);
	require("./notification")(app, urlApi, utils, config);
	require("./pay")(app, urlApi, utils, config);
	require("./proceedCheckout")(app, urlApi, utils, config);
};