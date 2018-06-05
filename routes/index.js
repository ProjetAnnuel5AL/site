module.exports = function(app, urlApi, urlLocal, utils ,config) {

	//FRONT
	require("./home")(app, urlApi);
	require("./visualisationAnnonce")(app, urlApi, utils, config);
	require("./item")(app, urlApi, utils);
	require("./itemList")(app, urlApi, utils);
	require("./registration")(app, urlApi, urlLocal, utils);
	require("./login")(app, urlApi, utils);
	require("./registrationValidation")(app, urlApi);
	require("./logout")(app);
	require("./profil")(app, urlApi, urlLocal, utils);
	require("./becomeProducer")(app, urlApi, utils);
	require("./ficheProducer")(app, urlApi, utils, config);
	require("./product")(app, urlApi);
	require("./cart")(app, urlApi, utils, config);

   
};