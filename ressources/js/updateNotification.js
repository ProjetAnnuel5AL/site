function updateNotif(userLogin){
  $.getJSON("/notification/userLogin", { userLogin: userLogin }).done(function (json) {
    console.log(json);
    var element;
    if (json.code == 0) {
      if(json.result.length > 0){
        $('#imageNotif').css("display", "inline");
      }else{
        $('#imageNotif').css("display", "none");
      }
      $('#notifLabel').text("Notifications ("+json.result.length+")");
      $('#notif-sidebar').empty();
      for (var elem in json.result) {
        element = "<li class='itemNotif'id='Notif"+json.result[elem].id+"'>" +
          "<div class='item-inner'>" +
          "<div>" +
          "<div style='margin-left: 10px;'>" +
          "<strong>" + json.result[elem].title + "</strong><br><span>" + json.result[elem].description + "</span>" +
          "</div>" +
          "<div>";
          if(json.result[elem].type=="info"){
            element += "<button class='btnInfo' title='Ok' type='button' onclick='deleteNotif("+json.result[elem].id+");'><span>Ok</span></a></button>"; 
          }else{
          element += "<a class='aNotif' href='"+json.result[elem].url+"?idNotif="+json.result[elem].id+"'><button class='btnValidate' title='Accept' type='button'><span>Accepter</span></button></a>" +
          "<button class='btnRefuse' title='Refuse' type='button' onclick='deleteNotif("+json.result[elem].id+");'><span>Refuser</span> </button>";
          }
          element += "</div>" +
          "</div>" +
          "</div>" +
          "</li>";
        $('#notif-sidebar').append(element);
      }
    }
  });
}

function deleteNotif(id){
  console.log(id);
  $.post("/notification/delete/idNotif", { id: id }).done(function (json) {
    console.log(json);
    if (json.code == 0) {
      updateNotif('<%- session.login %>');
    }
  });
}