module.exports = function(app, urlApi, utils){
  var rp = require("request-promise");
  var formidable = require("formidable");
 
  app.get('/itemList', function(req, res, next) {
      res.redirect("/itemList/1");
  });

	app.get('/itemList/:page', function(req, res, next) {
    var msgError = "";
    var categories= [];
    var products = [];
    var prixMax=0.0;
    var prixMin=Number.MAX_SAFE_INTEGER+0.1;
    var nbItems = 0;
    var listTab = "";

    var limit = (req.params.page -1)*20;

      rp({
        uri: urlApi + "/item/filter",
        method: "GET",
        json: true,
        headers: {
          'User-Agent': 'Request-Promise'
        },
        qs: {
          limit: limit
        }
      }).then(function (body) {
       
        if (body.code == 0) {
          listTab = body.result.list;
          nbItems = body.result.nbTotalItem;
    
          rp({
            uri: urlApi + "/item/getPriceMinMax",
            method: "GET",
            json: true,
            headers: {
              'User-Agent': 'Request-Promise'

            }
          }).then(function (body) {  
             prixMax=body.result.maxPrice;
             prixMin=body.result.minPrice;
          });
            rp({
              uri: urlApi + "/categories",
              method: "GET",
              json: true,
              headers: {
                'User-Agent': 'Request-Promise'

              }
            }).then(function (body) { 
               categories = body.result;
               rp({
                uri: urlApi + "/products",
                method: "GET",
                json: true,
                headers: {
                  'User-Agent': 'Request-Promise'
  
                }
              }).then(function (body) {  
                products = body.result;

                res.render('itemList.ejs', { msgError: "", urlApi: urlApi, categories: categories, products: products, listTab: listTab, prixMin: prixMin, prixMax: prixMax, session : req.session, currentPage: req.params.page, nbItems : nbItems, saveSearch: null });
              });
            });
                       
        } else {
          res.render("itemList.ejs", { msgError: body.message, urlApi: urlApi, categories: null, products: null, producers: null, cities: null, listTab: null, prixMin: null, prixMax: null, session: req.session,currentPage: req.params.page,  nbItems : 0, saveSearch: null });
        }
      });
  });

  app.get('/itemList/filter/:page', function(req, res, next) {
    var price =[];
    if(req.query.price) {
      price =  req.query.price.split(',');
    }else{
      price = [];
      price[0] = null;
      price[1] = null;
    }
    

    var category = req.query.category;
    if(req.query.category == 0) {
      category = null;
    }

    var product = req.query.product;
    if(req.query.product == 0) {
      product = null;
    }

    var msgError = "";
    var categories= [];
    var products = [];
    var prixMax=0.0;
    var prixMin=Number.MAX_SAFE_INTEGER+0.1;
    var nbItems = 0;
    var listTab = "";

    var saveSearch = {
      manualSearch : req.query.manualSearch,
      category : category,
      product : product,
      lat : req.query.lat,
      long : req.query.long,
      address: req.query.address ,
      priceMin : price[0],
      priceMax : price[1],
    };

    var limit = (req.params.page -1)*20;

      rp({
        uri: urlApi + "/item/filter",
        method: "GET",
        json: true,
        headers: {
          'User-Agent': 'Request-Promise'
        },
        qs: {
          manualSearch : req.query.manualSearch,
          category : category,
          product : product,
          lat : req.query.lat,
          long : req.query.long,
          priceMin : price[0],
          priceMax : price[1],
          limit: limit
        }
      }).then(function (body) {
        
        if (body.code == 0) {
          listTab = body.result.list;
          nbItems = body.result.nbTotalItem;
          rp({
            uri: urlApi + "/item/getPriceMinMax",
            method: "GET",
            json: true,
            headers: {
              'User-Agent': 'Request-Promise'
            }
          }).then(function (body) {  
             prixMax=body.result.maxPrice;
             prixMin=body.result.minPrice;
          });
            rp({
              uri: urlApi + "/categories",
              method: "GET",
              json: true,
              headers: {
                'User-Agent': 'Request-Promise'

              }
            }).then(function (body) { 
               categories = body.result;
               rp({
                uri: urlApi + "/products",
                method: "GET",
                json: true,
                headers: {
                  'User-Agent': 'Request-Promise'
  
                }
              }).then(function (body) {  
                products = body.result;
                res.render('itemList.ejs', { msgError: "", urlApi: urlApi, categories: categories, products: products, listTab: listTab, prixMin: prixMin, prixMax: prixMax, session : req.session, currentPage: req.params.page, nbItems : nbItems, saveSearch: saveSearch });
              });
            });
                       
        } else {
          res.render("itemList.ejs", { msgError: body.message, urlApi: urlApi, categories: null, products: null, producers: null, cities: null, listTab: null, prixMin: null, prixMax: null, session: req.session,currentPage: req.params.page,  nbItems : 0, saveSearch: saveSearch });
        }
      });
    
  });
};