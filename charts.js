//=== Initialisation des traces/charts de la page html ===
// Apply time settings globally
Highcharts.setOptions({
    global: { // https://stackoverflow.com/questions/13077518/highstock-chart-offsets-dates-for-no-reason
        useUTC: false,
        type: 'spline'
    },
    time: {timezone: 'Europe/Paris'}
});
// cf https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/spline-irregular-time/
chart1 = new Highcharts.Chart({
    title: {text: 'Temperatures'},
    subtitle: { text: 'Irregular time data in Highcharts JS'},
    legend: {enabled: true},
    credits: false,
    chart: {renderTo: 'container1'},
    xAxis: {title: {text: 'Heure'}, type: 'datetime'},
    yAxis: {title: {text: 'Temperature (Deg C)'}},
    series: [{name: 'ESP1', data: []},
	     {name: 'ESP2', data: []},
	     {name: 'ESP3', data: []}],
    //colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
    colors: ['red', 'green', 'blue'],
    plotOptions: {line: {dataLabels: {enabled: true},
			 //color: "red",
			 enableMouseTracking: true
			}
		 }
});

//=== Gestion de la flotte d'ESP =================================
var which_esps = [
    
    //	,"1761716416"
  //  "80:7D:3A:FD:C9:44",
    "80:7D:3A:FD:CF:68"
]
// var which_espsv = init1();

function process_each_esp(list_esp){
    console.log(list_esp.length);
    for (var i = 0; i < list_esp.length; i++) {
       
        process_esp(list_esp, i);
        proccess_loca_esp(list_esp, i);
    }
}
$(function() {
    $('#myform').submit(function(event) {
        event.preventDefault();
        console.log('inside prevent');
        node_url = 'https://lucioles.herokuapp.com';
        
         $.ajax({
                url: node_url.concat('/getPaye/'+$(this).what ), // URL to "GET" : /esp/temp ou /esp/light
                type: 'GET',
                
        
                success: function (resultat, statut) { // Anonymous function on success
                    console.log("ha London "+resultat)
                    
                    
                    
                    
                   
                  
                },
                error: function (resultat, statut, erreur) {
                },
                complete: function (resultat, statut) {
                } });
        
    /* $.ajax({
            type: 'GET',
            url: '/getPaye',
            data: { what: }
        });
        */
    });
})
 
//=== Installation de la periodicite des requetes GET============
function process_esp(which_esps,i){
    console.log(which_esps[i]);
    const refreshT = 10000 // Refresh period for chart
    esp = which_esps[i];    // L'ESP "a dessiner"
    //console.log(esp) // cf console du navigateur
    
    // Gestion de la temperature
    // premier appel pour eviter de devoir attendre RefreshT
    get_samples('/esp/temp', chart1.series[i], esp);
    //calls a function or evaluates an expression at specified
    //intervals (in milliseconds).
  /*  window.setInterval(get_samples,
		       refreshT,
		       '/esp/temp',     // param 1 for get_samples()
		       chart1.series[i],// param 2 for get_samples()
		       esp);            // param 3 for get_samples()*/
}

function proccess_loca_esp(esp,i){
    node_url = 'https://lucioles.herokuapp.com'
    console.log(esp[i]);
	
		
		
	    
    $.ajax({
    // On fait une requete et on recupere un geo json
   
   
    //URL de l'API
    url: node_url.concat("/geogs/"+esp[i].who) ,
    
    //Type de données
    dataType: "jsonp",
    
    //Méthode appelée lorsque le téléchargement a fonctionné
    success: function(geojson) {
	//Affichage des données dans la console
	console.log(geojson);
	
	//Création de la couche à partir du GeoJSON
	var layer = L.geoJSON(geojson);
	
	//Ajout de popup sur chaque objet
	layer.bindPopup(function(layer) {
	    console.log(layer.feature.properties);
	    return "Nom station : "+layer.feature.properties.nom+"<br/> "+layer.feature.properties.nombreemplacementstheorique + "  emplacements";
	});
	
	//Ajout de la couche sur la carte
	layer.addTo(map);
    },
    
    //Méthode appelée lorsque le téléchargement a échoué
    error: function() {
	alert("Erreur lors du téléchargement !");
    }      
});}




function getList(){
  /*  fetch('https://lucioles.herokuapp.com/esp/list')
    .then(response => response.text())
    .then(data =>
        process_each_esp(data));*/



return  new Promise(function(resolve, reject) {
   
    node_url = 'https://lucioles.herokuapp.com';
    
    $.ajax({
            url: node_url.concat('/esp/list'), // URL to "GET" : /esp/temp ou /esp/light
            type: 'GET',
            
    
            success: function (resultat, statut) { // Anonymous function on success
                console.log("ha result "+resultat)
                
                
                resolve(resultat);
                
               
              
            },
            error: function (resultat, statut, erreur) {
            },
            complete: function (resultat, statut) {
            }
        });
        
       
    


  });}

  var intervalId = window.setInterval(function(){
    getList().then((data) => {
        
        process_each_esp(data);
       // tst();
      })
      .catch((error) => {
        console.log(error)
      })
      
 
  }, 5000);




//=== Recuperation dans le Node JS server des samples de l'ESP et 
//=== Alimentation des charts ====================================

function get_samples(path_on_node, serie, wh){
    // path_on_node => help to compose url to get on Js node
    // serie => for choosing chart/serie on the page
    // wh => which esp do we want to query data
    
    //node_url = 'http://localhost:3000'
    node_url = 'https://lucioles.herokuapp.com'
    //node_url = 'http://192.168.1.101:3000'
   
console.log("hahowa"+wh.who);
    //https://openclassrooms.com/fr/courses/1567926-un-site-web-dynamique-avec-jquery/1569648-le-fonctionnement-de-ajax
    $.ajax({
        url: node_url.concat(path_on_node), // URL to "GET" : /esp/temp ou /esp/light
        type: 'GET',
        headers: { Accept: "application/json", },
	data: {"who": wh.who}, // parameter of the GET request
        success: function (resultat, statut) { // Anonymous function on success
            let listeData = [];
            resultat.forEach(function (element) {
		listeData.push([Date.parse(element.date),element.temp]);
		//listeData.push([Date.now(),element.value]);
            });
            serie.setData(listeData); //serie.redraw();
        },
        error: function (resultat, statut, erreur) {
        },
        complete: function (resultat, statut) {
        }
    });
}
