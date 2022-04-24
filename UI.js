$(function() {
    $('#inscription').submit(function(event) {
        event.preventDefault();
        //generaing random SHA1 hash
        
       // console.log('inside prevent'+$(this).what.val() );
        console.log('inside function js inscription');
        let form = document.getElementById('inscription');
        // console.log('inside prevent'+$(this).what.val() );
        var Name = form.elements["name"].value;
        var Email = form.elements["email"].value;
        var Mdps = form.elements["mdps"].value;
         console.log('inside preventval'+form.elements["email"].value );

        node_url = 'https://lucioles.herokuapp.com';
        $.ajax({
            url: node_url.concat('/inscription'), // URL to "GET" : /esp/temp ou /esp/light
            type: 'POST',
            data: {
                name: Name,
                email: Email, 
                mdps: Mdps // Second add quotes on the value.
              },
    
            success: function (resultat, statut) { // Anonymous function on success
                console.log("Envoi key to server results : "+resultat)
                if (resultat === 'deja inscrit'){
                    
                    document.getElementById("dejainscrit").style.display = "inline";
                }else if(resultat === 'inscrit'){

                    document.getElementById("doneU").style.display = "inline";
                }
                
                
                
               
              
            },
            error: function (resultat, statut, erreur) {
                console.log("Envoi key to server statut : "+statut+"resultat"+resultat+"erreur : "+erreur) 
            },
            complete: function (resultat, statut) {
                console.log("Envoi key to server statut : "+statut+"resultat"+resultat)
            } });
    });
})




$(function() {
    $('#login').submit(function(event) {
        event.preventDefault();
        //generaing random SHA1 hash
        
       // console.log('inside prevent'+$(this).what.val() );
        console.log('inside function js login');
        let form = document.getElementById('login');
        // console.log('inside prevent'+$(this).what.val() );
      
        var Email = form.elements["email"].value;
        var Mdps = form.elements["mdps"].value;
         console.log('inside preventval'+form.elements["email"].value );

        node_url = 'https://lucioles.herokuapp.com';
        $.ajax({
            url: node_url.concat('/login'), // URL to "GET" : /esp/temp ou /esp/light
            type: 'POST',
            data: {
                
                email: Email, 
                mdps: Mdps // Second add quotes on the value.
              },
    
            success: function (resultat, statut) { // Anonymous function on success
                console.log("Envoi key to server results : "+resultat)
                if (resultat === 'introuvable'){
                    console.log("1")
                   // document.getElementById("dejainscrit").style.display = "inline";
                }else if(resultat === 'mdp incorect'){
                    console.log("2")
                    //document.getElementById("doneU").style.display = "inline";
                }
                
               
              
            },
            error: function (resultat, statut, erreur) {
                console.log("Envoi key to server statut : "+statut+"resultat"+resultat+"erreur : "+erreur) 
            },
            complete: function (resultat, statut) {
                console.log("Envoi key to server statut : "+statut+"resultat"+resultat)
            } });
    });
})