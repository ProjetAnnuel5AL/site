
module.exports = function(app, urlApi){
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    var rp = require("request-promise");

    app.get("/", function(req, res) {
        console.log(req.session);
        res.render("home.ejs", {
            session: req.session
        });
    });
};
