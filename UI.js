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
                if (resultat === 'deja insrit'){
                    
                    document.getElementById("dejainscrit").style.visibility = "visible";
                }else{

                    document.getElementById("doneU").style.visibility = "visible";
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