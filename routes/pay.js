var rp = require("request-promise");

module.exports = function(app, urlApi,urlLocal,  utils){

    app.get("/testPay", function(req, res) {

        rp({
            url :"https://api.sandbox.paypal.com/v1/payments/payouts",
            method : "POST",
            headers : {
                "Authorization": "Bearer access_token$sandbox$g2j78gnmc8vgpty8$d4c7f2e136cee1333216b9da4b75a5b1",
                "Content-Type": "application/json"
            },
            json : {
                "sender_batch_header": {
                "sender_batch_id": "2018061701",
                "email_subject": "You have a payout!"
                },
                "items": [
                {
                  "recipient_type": "EMAIL",
                  "amount": {
                  "value": "9,87",
                  "currency": "EUR"
                  },
                  "note": "Thanks for your patronage!",
                  "sender_item_id": "201806170001",
                  "receiver": "azanlo@gmail.com"
                },
                ]
            },
         
          
           
        }, function (err, res, body) {
           console.log(body)
        });

        res.json({message:"in"})
    })

    app.get("/validatePay", function(req, res) {
    
        console.log(req);

        res.json({message:"in validate"})
    })

    app.get("/cancelPay", function(req, res) {
    
        console.log(req);

        res.json({message:"in cancel"})
    })
}


