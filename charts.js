var List_SERIES = [];
var List_map = [];
var List_cities = [];

fetch('https://luciole.herokuapp.com/cities')
  .then(response => response.json())
  .then(data =>  setdatae(data) );


  function setdatae(data){
    var elem2 = document.getElementById('key');
for(let b=0;b<data.length;b++){
   
    var option1 = new Option(data[b].city, data[b].city);

    elem2.appendChild(option1);
}


  }

    
 
 
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
    subtitle: { text: 'Temperture all arround the world'},
    legend: {enabled: true},
    credits: false,
    chart: {renderTo: 'container1'},
    xAxis: {title: {text: 'Heure'}, type: 'datetime'},
    yAxis: {title: {text: 'Temperature (Deg C)'}},
   /* series: [{name: 'ESP1', data: []},
	     {name: 'ESP2', data: []},
	     {name: 'ESP3', data: []}],*/
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
    $('#form-keys').submit(function(event) {
       

        event.preventDefault();
       
        //generaing random SHA1 hash
        
       // console.log('inside prevent'+$(this).what.val() );
        console.log('key from form : ');
        node_url = 'https://luciole.herokuapp.com';
        $.ajax({
            url: node_url.concat('/getkey/test'), // URL to "GET" : /esp/temp ou /esp/light
            type: 'GET',
            
    
            success: function (resultat, statut) { // Anonymous function on success
                console.log("Envoi key to server results : "+resultat)
                
                
                
                
               
              
            },
            error: function (resultat, statut, erreur) {
                console.log("Envoi key to server statut : "+statut+"resultat"+resultat+"erreur : "+erreur) 
            },
            complete: function (resultat, statut) {
                console.log("Envoi key to server statut : "+statut+"resultat"+resultat)
            } });

            document.getElementById('success').style.display= 'inline';
            document.getElementById('bt').style.display =  'none';

    });
})
$(function() {
    $('#myform').submit(function(event) {
        event.preventDefault();
        let xhr = new XMLHttpRequest();
        let form = document.getElementById('myform');
        xhr.open("POST", "https://luciole.herokuapp.com/getPaye");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
          }};
        
          let textToPost = `{
           
            "key": "${form.elements["key"].value}"
           }`;
        
        xhr.send(textToPost);

    });
})
$(function() {
    $('#delform').submit(function(event) {

        event.preventDefault();
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
          

        }); 
        renislizemap()

        let xhr = new XMLHttpRequest();
        let form = document.getElementById('delform');
        var seriesLength = chart1.series.length;
        for(var i = seriesLength - 1; i > -1; i--)
        {
            //chart.series[i].remove();
            if(chart1.series[i].name ==form.elements["capitalname"].value)
                chart1.series[i].remove();

        }



        var index1 = List_SERIES.findIndex(x1 => x1==form.elements["capitalname"].value)
        List_SERIES.splice(index1, 1) 
        var index2 = List_map.findIndex(x1 => x1==form.elements["capitalname"].value)
        List_map.splice(index2, 1) 

        var selectobject = document.getElementById("capitalname");
        


        xhr.open("POST", "https://luciole.herokuapp.com/deleteCapital");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
          }};
        
          let textToPost = `{
           
            "key": "${form.elements["capitalname"].value}"
           }`;
        
        xhr.send(textToPost);
        for (var i=0; i<selectobject.length; i++) {
            if (selectobject.options[i].value == form.elements["capitalname"].value)
                selectobject.remove(i);
        }

    });

   
})
   
function renislizemap(){

    List_map = [];
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c'],
    }).addTo(map)
    
   // getList();
}


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



function process_series(list){

  
    var elem = document.getElementById('capitalname');
    
    for (let i = 0; i < list.length; i++) {

       
       
       if (List_SERIES.includes(list[i].who)) {



       }else{
        console.log("inside else")
        List_SERIES.push(list[i].who)
        
        chart1.addSeries({
            id:i,
            name: list[i].who, 
            data: []
            
          });

          var option = new Option(list[i].who, list[i].who);
          // then append it to the select element
          elem.appendChild(option);
       }
       
     
       
      
      };


}

function proccess_loca_esp(esp,i){
    
    node_url = 'https://luciole.herokuapp.com'
    console.log("inside localzi "+esp[i]);
	
     
        if (List_map.includes(esp[i].who)) {
 
 
 
        }else{
         
            List_map.push(esp[i].who)
            $.ajax({
                // On fait une requete et on recupere un geo json
               
               
                //URL de l'API
                url: node_url.concat("/geogs/"+esp[i].who) ,
                
                //Type de données
                dataType: "jsonp",
                
                //Méthode appelée lorsque le téléchargement a fonctionné
                success: function(geojson) {
                //Affichage des données dans la console
                console.log("inside locali geogson"+geojson);
                if (geojson != undefined ){

  //Création de la couche à partir du GeoJSON
  var layer = L.geoJSON(geojson);
                
  //Ajout de popup sur chaque objet
  layer.bindPopup(function(layer) {
      console.log(layer.feature.properties);
      return "Nom station : "+layer.feature.properties.name+"<br/> "+layer.feature.temp + "°C";
  });
  
  //Ajout de la couche sur la carte
  layer.addTo(map);

                }
              
                },
                
                //Méthode appelée lorsque le téléchargement a échoué
                error: function() {
                alert("Erreur lors du téléchjarkjgement !");
                }      
            });
 
        }
        
      
        
       
	    
    



}




function getList(){
  

  /*  fetch('https://luciole.herokuapp.com/esp/list')
    .then(response => response.text())
    .then(data =>
        process_each_esp(data));*/




return  new Promise(function(resolve, reject) {
   
    node_url = 'https://luciole.herokuapp.com';
    
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
       
        process_series(data);
        process_each_esp(data);
       
       // tst();
      })
      .catch((error) => {
        console.log(error)
      })
      
 
  }, 5000);




//=== Recuperation dans le Node JS server des samples de l'ESP et 
//=== Alimentation des charts ====================================

function get_samples(path_on_node, serie, wh,what){
    // path_on_node => help to compose url to get on Js node
    // serie => for choosing chart/serie on the page
    // wh => which esp do we want to query data
    
    //node_url = 'http://localhost:3000'
    node_url = 'https://luciole.herokuapp.com'
    //node_url = 'http://192.168.1.101:3000'
   
console.log("hahowa"+wh.who);
    //https://openclassrooms.com/fr/courses/1567926-un-site-web-dynamique-avec-jquery/1569648-le-fonctionnement-de-ajax
    $.ajax({
        url: node_url.concat(path_on_node), // URL to "GET" : /esp/temp ou /esp/light
        type: 'GET',
        headers: { Accept: "application/json", },
	data: {"who": wh.who,"what":what}, // parameter of the GET request
        success: function (resultat, statut) { // Anonymous function on success
            let listeData = [];
            resultat.forEach(function (element) {
		listeData.push([Date.parse(element.date),element.temp]);
        console.log("chooof --------------------"+serie)
		//listeData.push([Date.now(),element.value]);
            });
            if ( serie != undefined){
                serie.setData(listeData);
            }else(console.log("raha undifined azebi"))
            
        },
        error: function (resultat, statut, erreur) {
        },
        complete: function (resultat, statut) {
        }
    });

    


}
function ShowDash(){
    console.log("inside dahs")
    document.getElementById('acceuil').style.display='inline';
    document.getElementById('subscribe').style.display =  'none';
}
function ShowSub(){
    console.log("inside sub");
    document.getElementById('acceuil').style.display =  'none';;
    document.getElementById('subscribe').style.display='inline';
}
