'use strict';


var express = require('express');
var app = express();

var path    = require("path");

app.set("view engine" , "ejs");
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.get("/" , function(req,res){

  var modelID = (function(uA){
  var build_tag = new RegExp("Build");
  var device = "";

  if(build_tag.test(uA)){
  	var keyword = new RegExp("\;(.)+Build");
  	var check_sentences = keyword.exec(uA).toString().split(";");
  	for(let i of check_sentences){
  		let device_key = new RegExp("Build");
  		if(device_key.test(i)){
  			device = i.replace("Build" , "");
  			device = device.replace("/" , "");
  			device = device.replace("," , "");
  		}
  	}
  }
  return device;
  })(req.get('User-Agent'));

  if(modelID){
    (async function(input_model){

      var getPhoneModel = function(inputStr){
      var request = require("request");
      var cheerio = require("cheerio");
      return new Promise(function(resolve , reject){
        var searchQuery = encodeURIComponent(inputStr);
        request({
          url : "https://www.gsmarena.com/res.php3?sSearch=" + searchQuery,
          "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36",
          method : "GET"
        } , function(error , response , body){
            if(!error && response.statusCode == 200){
              const $ = cheerio.load(body);
              var modelResult;
              if(!$("#review-body").find(".no-results").length){
                var model = $($($("#review-body")).find("strong")[0]).html();
                var brRE = new RegExp("<br>" , "gm");
                model = model.replace(brRE , " ");
                modelResult = $(model).text();
                resolve(modelResult);
            }
            else {
              reject(error);
            }
          }
        });
      });
    };

        try{
          var phoneModel = await getPhoneModel(input_model);

          if(!phoneModel)
            phoneModel = input_model;


          var N = Math.floor((Math.random() * 20) + 1);
      	  var persent = Math.floor((Math.random() * 100) + 1);


          var alert_message = "您的Android系統 : {0}受到嚴重損壞，按下確定修補它".format(phoneModel);
          res.render("index" ,
            {
              title : "安卓系統警告!!",
              alert_mes : alert_message,
              device_model : phoneModel,
              nVirus : N,
              damagedPersent : persent
            });
        }
        catch(error){
          res.status(500).send("Error!");
        }
    })(modelID);
  }
  else {
    res.sendFile(path.join(__dirname+'/public/notAndroid.html'));
  }



});

String.prototype.format = function(){
	let str = this;
	let i = arguments.length;

	while(i--){
		let re = new RegExp("\\{" + i + "\\}" , "gm");
		str = str.replace(re , arguments[i]);
	};
	return str;
};

app.listen(3000);
console.log("Running Server on Port 3000");
