module.exports = function(app, urlApi, utils){
  var rp = require("request-promise");
  var formidable = require("formidable");
 
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	
	app.get('/itemList/:page', function(req, res, next) {
    var msgError = "";
    var categories= [];
    var products = [];
    var producers = [];
    var cities = [];
    var listTab = "";
    var prixMax=0.0;
    var prixMin=Number.MAX_SAFE_INTEGER+0.1;
    var limit = (req.params.page -1)*20

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
          for (var item in body.list) {
            if(prixMax < body.list[item].price){
              prixMax = body.list[item].price;
            }
            if(prixMin > body.list[item].price){
              prixMin = body.list[item].price;
            }
            if(!cities.includes(body.list[item].city)){
              cities.push(body.list[item].city);
            }
            if(producers.filter(producers => (producers.id === body.list[item].idProducer)).length===0){
              producers.push({id:body.list[item].idProducer, name:body.list[item].producerFirstName+" "+body.list[item].producerName});
            }
            if(categories.filter(categories => (categories.id === body.list[item].categId)).length===0){
              categories.push({id:body.list[item].categId, name:body.list[item].categoryName});
            }
            if(products.filter(products => (products.id === body.list[item].productId)).length===0){
              products.push({id:body.list[item].productId, name:body.list[item].productName, idCat:body.list[item].categId, nameCat:body.list[item].categoryName});
            }

           
            
            
           /* listTab += "<tr>"
              +"<td><a href='/visualisationAnnonce/"+body.list[item].id+"'><img src='"+urlApi+"/itemPhotos/"+body.list[item].id+"/0."+body.list[item].fileExtensions.split(';')[0]+"' width='150' height='150'></a></td>"
              +"<td style='text-align:center;vertical-align:middle'><a href='/visualisationAnnonce/"+body.list[item].id+"'><h3>"+body.list[item].itemName+"</h3></a></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].description+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].productName+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].producerFirstName+" "+body.list[item].producerName+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].city+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].quantity+" "+ body.list[item].unitName+"s disponibles</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h3>"+body.list[item].price+"€/"+body.list[item].unitName+"</h3></td>";
            if(body.list[item].login == req.session.login){
              listTab +="<td style='text-align:center;vertical-align:middle'><a href='/item/edit/"+body.list[item].id+"'><h3><button class='btn btn-primary'>Modifier</button></h3></a></td>";
            }
            listTab +="</tr>";*/
          }
          res.render('itemList.ejs', { msgError: "", urlApi: urlApi, categories: categories, products: products, producers: producers, cities: cities, listTab: body.list, prixMin: prixMin, prixMax: prixMax, session : req.session, currentPage: req.params.page, nbItems : body.nbTotalItem });
        } else {
          res.render("itemList.ejs", { msgError: body.message, urlApi: urlApi, categories: null, products: null, producers: null, cities: null, listTab: null, prixMin: null, prixMax: null, session: req.session,currentPage: req.params.page });
        }
      });
   
  });

  app.get('/itemList/filter', function(req, res, next) {
    var msgError = "";
    var listTab = "";
    if(req.query.city == "Pas de filtrage"){
      req.query.city = null;
    }
    if(req.query.categoryId==0){
      req.query.categoryId = null;
    }
    if(req.query.productId==0){
      req.query.productId = null;
    }
    if(req.query.producerId==0){
      req.query.producerId = null;
    }
    
      rp({
        uri: urlApi + "/item/filter",
        method: "GET",
        json: true,
        headers: {
          'User-Agent': 'Request-Promise'
        },
        qs: {
          remainingQuantity: req.query.remainingQuantity,
          priceMin: req.query.priceMin,
          priceMax: req.query.priceMax,
          categoryId: req.query.categoryId,
          productId: req.query.productId,
          producerId: req.query.producerId,
          city: req.query.city,
          limit: '150'
        }
      }).then(function (body) {
        if (body.code == 0) {
          /*for (var item in body.list) {
            listTab += "<tr>"
              +"<td><a href='/visualisationAnnonce/"+body.list[item].id+"'><img src='"+urlApi+"/itemPhotos/"+body.list[item].id+"/0."+body.list[item].fileExtensions.split(';')[0]+"' width='150' height='150'></a></td>"
              +"<td style='text-align:center;vertical-align:middle'><a href='/visualisationAnnonce/"+body.list[item].id+"'><h3>"+body.list[item].itemName+"</h3></a></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].description+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].productName+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].producerFirstName+" "+body.list[item].producerName+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].city+"</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h5>"+body.list[item].quantity+" "+ body.list[item].unitName+"s disponibles</h5></td>"
              +"<td style='text-align:center;vertical-align:middle'><h3>"+body.list[item].price+"€/"+body.list[item].unitName+"</h3></td>";
            if(body.list[item].login == req.session.login){
              listTab +="<td style='text-align:center;vertical-align:middle'><a href='/item/edit/"+body.list[item].id+"'><h3><button class='btn btn-primary'>Modifier</button></h3></a></td>";
            }
            listTab +="</tr>";
          }*/
          res.send({ msgError: "", listItem:  body.list, urlApi: urlApi});
        } else {
          res.send({ msgError: "erreur lors de la requête AJAX"});
        }
      });
    
  });
};