// Importation des modules
var path = require('path');
var nodemailer = require('nodemailer');
var session = require('express-session')
const MemoryStore = require('memorystore')(session)
const express = require('express');
const request = require('request');
const app = express();
const fs = require('fs');

let ejs = require('ejs');

const mqtt = require('mqtt');
const crypto = require('crypto')
var GeoJSON = require('geojson');
app.set('trust proxy', 1);
app.use(session({
	secret: 'safouaneKey',
	resave: false, 
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	  }),
	saveUninitialized: true,
	cookie: {
 
		// Session expires after 1 min of inactivity.
		expires: 60000*5
	}
  }));
  //middleware responsible for checking authentification before every req
const isAuth = (req,res,next) => {

if ( req.session.isAuth){
	next()
}else {
	res.sendFile(path.join(__dirname + '/Pagelogin.html'));
}

}

   
// Topics MQTT
const TOPIC_Miage = 'iot/M1Miage2022/prive'
//app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/')));
//---  The MongoDB module exports MongoClient, and that's what
// we'll use to connect to a MongoDB database.
// We can use an instance of MongoClient to connect to a cluster,
// access the database in that cluster,
// and close the connection to that cluster.
const {MongoClient} = require('mongodb');

//----------------------------------------------------------------
// This function will retrieve a list of databases in our cluster and
// print the results in the console.
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    
    console.log("Databases in Mongo Cluster : \n");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
var wholist = [];
var wholist1 = [];
var wholist_payes = [];
var wholist_payes1 = [];
//----------------------------------------------------------------
// asynchronous function named main() where we will connect to our
// MongoDB cluster, call functions that query our database, and
// disconnect from our cluster.
async function v0(){
    const mongoName = "lucioles"                   //Nom de la base
    //const mongoUri = 'mongodb://localhost:27017/'; //URL de connection		
    //const mongoUri = 'mongodb://10.9.128.189:27017/'; //URL de connection
 //const mongoUri = 'mongodb+srv://safouane:ouazri@cluster0.6ylmr.mongodb.net/lucioles?retryWrites=true&w=majority';
  var mongoUri = process.env.MONGOLAB_URI
   ;


    //Now that we have our URI, we can create an instance of MongoClient.
    const mg_client = new MongoClient(mongoUri,
				      {useNewUrlParser:true, useUnifiedTopology:true});

    // Connect to the MongoDB cluster
    mg_client.connect(function(err,  mg_client){
	if(err) throw err; // If connection to DB failed ... 
   
	//===============================================    
	// Print databases in our cluster
	listDatabases(mg_client);

	//===============================================    
	// Get a connection to the DB "lucioles" or create
	dbo = mg_client.db(mongoName);

	// Remove "old collections : temp and light
	/*dbo.listCollections({name: "localisation"})
	    .next(function(err, collinfo) {
		if (collinfo) { // The collection exists
		    //console.log('Collection temp already exists');
		    dbo.collection("localisation").drop() 
		}
	    });*/

	dbo.listCollections({name: "sensors"})
	    .next(function(err, collinfo) {
		if (collinfo) { // The collection exists
		
		    //console.log('Collection temp already exists');
		    dbo.collection("sensors").drop() 
		}
	    });

	//===============================================
	// Connexion au broker MQTT distant
	//
	//const mqtt_url = 'http://192.168.43.215:1883'
	//const mqtt_url = 'http://broker.hivemq.com'
	const mqtt_url = 'http://test.mosquitto.org:1883'
	var client_mqtt = mqtt.connect(mqtt_url);
	
	//===============================================
	// Des la connexion, le serveur NodeJS s'abonne aux topics MQTT 
	//
	client_mqtt.on('connect', function () {
	    client_mqtt.subscribe(TOPIC_Miage, function (err) {
		if (!err) {
		    //client_mqtt.publish(TOPIC_LIGHT, 'Hello mqtt')
		    console.log('Node Server has subschribed to ', TOPIC_Miage);
		}
	    })
	  
	})

	//================================================================
	// Callback de la reception des messages MQTT pour les topics sur
	// lesquels on s'est inscrit.
	// => C'est cette fonction qui alimente la BD !
	//
	client_mqtt.on('message', function (topic, message) {

	    console.log("\nMQTT msg on topic : ", topic.toString());
	    console.log("Msg payload : ", message.toString());
		console.log("topic base: ", path.parse(topic.toString()).base);
		
		
	    // Parsing du message suppos??? recu au format JSON
	    message = JSON.parse(message);
 
		key6 = message.key;

		dbo.collection("keys").findOne({key:key6},function(err, result) {
			if (err) throw err;
			
		if ( result !== null){


			wh = message.info.ident;

			temper = message.status.temperature;
			lght = message.status.light;
			
			lat = message.lat;
			lgn = message.lgn;
			// Debug : Gerer une liste de who pour savoir qui utilise le node server	
		   
			var index = wholist.findIndex(x => x.who==wh)
			if (index === -1){
			wholist.push({who:wh});	    
			}
			console.log("wholist using the node server :", wholist);
	
			// Mise en forme de la donnee ??? stocker => dictionnaire
			// Le format de la date est iomportant => compatible avec le
			// parsing qui sera realise par hightcharts dans l'UI
			// cf https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_tolocalestring_date_all
			// vs https://jsfiddle.net/BlackLabel/tgahn7yv
			// var frTime = new Date().toLocaleString("fr-FR", {timeZone: "Europe/Paris"});
			var frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
			var new_entry = { date: frTime, // timestamp the value 
					  who: wh,      // identify ESP who provide 
					  temp: temper,    // temp value
					  light: lght      // light value
					};
			
			// On recupere le nom basique du topic du message
			var key = path.parse("sensors").base;
			
			// Stocker le dictionnaire qui vient d'etre cr?????? dans la BD
			// en utilisant le nom du topic comme key de collection
			dbo.collection(key).insertOne(new_entry, function(err, res) {
			if (err) throw err;
			console.log("\nItem : ", new_entry, 
			"\ninserted in db in collection :", key);
			});
	
			//////////////////////
			
				
				var index1 = wholist1.findIndex(x1 => x1.who1==wh)
			if (index1 === -1){
			wholist1.push({who1:wh});
			
		
			var second_entry = { date: frTime, // timestamp the value 
				who: wh,      // identify ESP who provide 
				latitude: lat,   
				longitude: lgn     
			  };
		
			// On recupere le nom basique du topic du message
			var key_loc = path.parse("localisation").base;
	
	 dbo.collection(key_loc).insertOne(second_entry, function(err, res) {
			if (err) throw err;
			});
			}


		 }


			});




	   
		
		

	    // Debug : voir les collections de la DB 
	    //dbo.listCollections().toArray(function(err, collInfos) {
		// collInfos is an array of collection info objects
		// that look like: { name: 'test', options: {} }
	    //	console.log("List of collections currently in DB: ", collInfos); 
	    //});
	}) // end of 'message' callback installation

	//================================================================
	// Fermeture de la connexion avec la DB lorsque le NodeJS se termine.
	//
	process.on('exit', (code) => {
	    if (mg_client && mg_client.isConnected()) {
		console.log('mongodb connection is going to be closed ! ');
		mg_client.close();
	    }
	})
	
    });// end of MongoClient.connect
}// end def main

//================================================================
//==== Demarrage BD et MQTT =======================
//================================================================
v0().catch(console.error);

//====================================
// Utilisation du framework express
// Notamment g???r???r les routes 

// et pour permettre de parcourir les body des requetes
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//This lets you serve static files (such as HTML, CSS and JavaScript)
//from the directory you specify. In this case, the files will be
//served from a folder called public : 
//app.use(express.static(path.join(__dirname, 'public')));



app.use(function(request, response, next) { //Pour eviter les problemes de CORS/REST
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "*");
    response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});

//================================================================
// Answering GET request on this node ... probably from navigator.
// => REQUETES HTTP reconnues par le Node
//================================================================


    // Use that city name to fetch data
    // Use the API_KEY in the '.env' file


// Route / => Le node renvoie la page HTML affichant les charts
app.get('/',isAuth, function (req, res) {
	//swig.renderFile('try.html');
	//res.render("/try") ;
	res.sendFile(path.join(__dirname + '/indexApp.html'));
});

app.get('/indexApp', isAuth,function (req, res) {
	//swig.renderFile('try.html');
	//res.render("/try") ;
	res.sendFile(path.join(__dirname + '/indexApp.html'));
});
app.get('/cities',function (req, res) {
	let rawdata = fs.readFileSync('cities.json');
	
let cities = JSON.parse(rawdata);

	res.send(cities);
});
app.get('/esp/list', function (req, res) {
	

    res.send(wholist) ;
});

app.get('/logout', function (req, res) {

	req.session.destroy((err) => {
		res.redirect('/') // will always fire after session is destroyed
	  })
});
app.get('/checkuser',isAuth, function (req, res) {
	
	
	dbo.collection("Users").findOne({email:req.session.mail},function(err, result) {
		if (err) throw err;


		res.send(result.authorized) ;

		});

});
app.get('/setAuth', isAuth,function (req, res) {
	var myquery = { email: req.session.mail };
	var newvalues = { $set: {authorized: true} };


	dbo.collection("Users").updateOne(myquery, newvalues, function(err, res) {
		if (err) throw err;
		console.log("1 document updated");
		
	  });

});
app.post('/login', function (req, res) {

	var reqeEmail= req.body.email;
	var mdps = req.body.mdps;
	dbo.collection("Users").findOne({email:reqeEmail},function(err, result) {
		if (err) throw err;
		if ( result == null){
			res.send("introuvable") ;
		}else if(result.mdps !== mdps){
			res.send("mdp incorect") ;
		}else{
		


			req.session.isAuth = true;
			req.session.name = result.name;
			req.session.mail = result.email;


			res.send("https://luciole.herokuapp.com/indexApp") ;
		}
		

		});
		
});
app.post('/inscription', function (req, res) {
	

	var frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
	var new_entry = { date: frTime, // timestamp the value 
			  name: req.body.name,      // identify ESP who provide 
			  email: req.body.email,    // temp value
			  mdps: req.body.mdps,
			  authorized: false     
			};
			var ins =	dbo.collection("Users").findOne({email:req.body.email},function(err, result) {
				if (err) throw err;
				
			if ( result == null){
				var key3 = path.parse("Users").base;
	
// Stocker le dictionnaire qui vient d'etre cr?????? dans la BD
// en utilisant le nom du topic comme key de collection
dbo.collection(key3).insertOne(new_entry, function(err, res) {
if (err) throw err;

return " inscrit" 
});
res.send("inscrit") ;
				return " inscrit" 
			}else{
				res.send("deja inscrit") ;
				ins = "deja inscrit" ;
				return "deja inscrit"  ;
			}	});

	


});

app.get('/geogs/:what', function (req, res) {

	esp_mac_address = req.params.what
	var index1 = wholist.findIndex(x1 => x1.who==esp_mac_address)
	
	if (index1 === -1){
	}else{
	
		var key1 = path.parse("sensors").base;
		dbo.collection(key1).findOne({who:esp_mac_address},function(err, result) {
			if (err) throw err;
	if (result  != null ){

		var data = { name: esp_mac_address, temp: result.temp,  lat: result.latitude , lng: result.longitude };
	  
				
		var lol = GeoJSON.parse(data, {Point: ['lat', 'lng'], include: ['name','temp']  });
	}
			
		res.jsonp(lol) ;
			 // This is the response.
			console.log('end find');
			});
			
		


	}


});

// The request contains the name of the targeted ESP !
//     /esp/temp?who=80%3A7D%3A3A%3AFD%3AC9%3A44
// Exemple d'utilisation de routes dynamiques
//    => meme fonction pour /esp/temp et /esp/light
app.get('/esp/:what', function (req, res) {
	wh = req.query.who // get the "who" param from GET request
    // => gives the Id of the ESP we look for in the db	
   // cf https://stackabuse.com/get-query-strings-and-parameters-in-express-js/


   var index1 = wholist.findIndex(x1 => x1.who==wh);
			if (index1 === -1){
			}else{
				wa = req.params.what // get the "what" from the GET request : temp or light ?
    
    console.log("\n--------------------------------");
    console.log("A client/navigator ", req.ip);
    console.log("sending URL ",  req.originalUrl);
    console.log("wants to GET ", wa);
    console.log("values from zobject ", wh);
    
    // R???cup???ration des nb derniers samples stock???s dans
    // la collection associ???e a ce topic (wa) et a cet ESP (wh)
    const nb = 200;
	var key2 = path.parse("sensors").base;
    
    //dbo.collection(key).find({who:wh}).toArray(function(err,result) {
    dbo.collection(key2).find({who:wh}).sort({_id:-1}).limit(nb).toArray(function(err, result) {
	if (err) throw err;
	console.log(result);
	res.json(result.reverse()); // This is the response.
	console.log('end find');
    });
    console.log('end ');
			}
  
   
});



app.post('/getPaye', function(req, res) {

	wh = req.body.key;
	
		var index = wholist_payes.findIndex(x => x.who==wh)
		
	    if (index === -1){
			wholist_payes.push({who:wh});	
		
	    }
		var index1 = wholist.findIndex(x1 => x1.who==wh)
	    if (index1 === -1){
		wholist.push({who:wh});	    
	    }
	    console.log("payee using the node server :", wholist_payes);
		

});
app.post('/deleteCapital', function(req, res) {

	wh = req.body.key;
	
		var index = wholist_payes.findIndex(x => x.who==wh)
		
	    if (index === -1){
	    }else{
		
			wholist_payes.splice(index, 1) 
			var myquery = { who: wh };
			dbo.collection("sensors").deleteMany(myquery, function(err, obj) {
				if (err) throw err;

				
			  });
			
		}
		var index1 = wholist.findIndex(x1 => x1.who==wh)
	    if (index1 === -1){
		  
	    }else{
			wholist.splice(index1, 1) 
		}
		

});


var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = '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';
app.get('/getkey/:what', function(req, res) {
	var frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();
   var key4 =  crypto.createHash('sha1').update(current_date + random).digest('hex');
   
   var new_entry = { date: frTime, // timestamp the value 
	key: key4    // light value
  };

// On recupere le nom basique du topic du message
var key_collection = path.parse("keys").base;

// Stocker le dictionnaire qui vient d'etre cr?????? dans la BD
// en utilisant le nom du topic comme key de collection
dbo.collection(key_collection).insertOne(new_entry, function(err, res) {
if (err) throw err;
});

new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({

	"sender":{ "email":"cava_159@outlouk.fr", "name":"Safouane"},
	"subject":" your Key to connect to luciole devine",
	"templateId":1,
	"params":{
	   "key": key4
	},
	"messageVersions":[
	  //Definition for Message Version 1 
	  {
		  "to":[
			 {
				"email":req.session.mail,
				"name":req.session.name
			 }
		  ],
		  "params":{
			 "name":req.session.name
		  },
		  "subject":"your Key to connect to luciole devine"
	   }
   ]

}).then(function(data) {
 console.log(data);
}, function(error) {
 console.error(error);
});


		

});
	function process_cities(){
		
		
		for ( var i in wholist_payes  ) { 
			
		
			request('https://api.openweathermap.org/data/2.5/weather?q='+wholist_payes[i].who+'&appid=be603e7ca90475b301b1e312c2e5c71a', { json: true }, (err, res, body) => {
			  if (err) { return console.log(err); }

			  if (body  != null ){
			  var frTime = new Date().toLocaleString("sv-SE", {timeZone: "Europe/Paris"});
			
			  var second_entry = { date: frTime, // timestamp the value 
				who: body.name,      // identify ESP who provide 
				  // light value
				temp: body.main.temp - 273.15,
				temp_min: body.main.temp_min - 273.15,
				temp_max: body.main.temp_max - 273.15,
				wind: body.wind.speed,
				clouds: body.clouds.all,
				latitude: body.coord.lat,    // temp value
					longitude: body.coord.lon     // light value
	
			  };
			 
			
			// On recupere le nom basique du topic du message
			var key5 = path.parse("sensors").base;
			
			// Stocker le dictionnaire qui vient d'etre cr?????? dans la BD
			// en utilisant le nom du topic comme key de collection
			dbo.collection(key5).insertOne(second_entry, function(err, res) {
			if (err) throw err;
			});
		}


	});

}}
	let myVar = setInterval(function(){ process_cities() }, 1000);



					
//================================================================
//==== Demarrage du serveur Web  =======================
//================================================================
// L'application est accessible sur le port 3000 mais pas que !!!

// cf https://stackoverflow.com/questions/4840879/nodejs-how-to-get-the-servers-port
var listener = app.listen(process.env.PORT || 3000, function(){
    console.log('Express Listening on port ' + listener.address().port); //Listening on port 8888
});
