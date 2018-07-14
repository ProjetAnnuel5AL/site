var groupId;

function subscribe(){
  $.post( "/producersGroupFeed/subscribe/idGroup", { idGroup: groupId})
  .done(function( data ) {
    console.log(data);
    if(data.code=="0"){
      $("#subscribebtn").css("display", "none");
      $("#unsubscribebtn").css("display", "inline-block");
      swal("Bravo!", "Vous êtes maintenant abonné à la coopérative, vous recevrez les actualités de la coopérative sous forme de notifications", "success");
    }else{
      swal("Erreur!", "Erreur technique inconnue, veuillez réessayer plus tard", "error");
    }
  })
  .fail(function() {
    swal("Erreur!", "Erreur technique inconnue, veuillez réessayer plus tard", "error");
  })
  .always(function() {
  });
}

function unsubscribe(){
  $.post( "/producersGroupFeed/unsubscribe/idGroup", { idGroup: groupId})
  .done(function( data ) {
    console.log(data);
    if(data.code=="0"){
      $("#subscribebtn").css("display", "inline-block");
      $("#unsubscribebtn").css("display", "none");
    }else{
      swal("Erreur!", "Erreur technique inconnue, veuillez réessayer plus tard", "error");
    }
  })
  .fail(function() {
    swal("Erreur!", "Erreur technique inconnue, veuillez réessayer plus tard", "error");
  })
  .always(function() {
  });
}