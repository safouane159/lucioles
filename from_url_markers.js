function proccess_loca_esp(esp,i){


	$.ajax({
    // On fait une requete et on recupere un geo json
    
    //URL de l'API
    url: "https://lucioles.herokuapp.com/geogs/"+ esp[i],
    
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
