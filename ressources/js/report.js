var modal = document.getElementById('modalReport');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

window.onclick = function(event) {
    if (event.target == modal) {
        
        modal.style.display = "none";
    }
}

span.onclick = function() {
    modal.style.display = "none";
}

function sendReportItem(){
    var radio = document.getElementsByName("motif");
    var a = null;
    for(var i =0; i<radio.length; i++){
        if( radio[i].checked == true){
            a = radio[i]
            break;
        }
    }
    if(a == null){
        document.getElementById("messageModalReport").style.visibility= "visible";
        document.getElementById("messageModalReport").style.position = "relative";
    }else{
    
        $.ajax({
            type: 'POST',
            url: '/report/item',
            data: {
                "idMotif": a.value,
                "idItem": document.getElementById("idItemReport").value,
            },
            timeout: 3000,
            success: function(data){
                console.log(data)
                if(data.code =="0"){
                    modal.style.display = "none";
                    alert("Report effectué.");
                }else{
                    modal.style.display = "none";
                    alert("Impossible d'effectuer le report.");
                }
            },
            error: function(err){
                modal.style.display = "none";
                alert("Impossible d'effectuer le report.");
            }
        });
    }
}

function loadReportItem(idItem){
    
    var html ="";
    $.getJSON("/report/item").done(function( json ) {
        if(json){
            html+='<br /><p id="messageModalReport" style="visibility:hidden;position:absolute;color:red;">Veuillez selectionner un motif.</p><input type="hidden" value="'+idItem+'" name="idItem" id="idItemReport"/><div id="radioMotif">';
            for(var i =0; i<json.length; i++){
                html+='<input type="radio" name="motif" value="'+json[i].idMotif+'" required/> '+json[i].nameMotif+' <br/>'
            }
            html+='</div><br /><button type="submit" id="submitbtn" class="btn" onclick="sendReportItem()">Valider</button><br />'
            document.getElementById("modal-report-body").innerHTML = html;
            modal.style.display = "block";   
        }
    });
}


function sendReportProducer(){
    var radio = document.getElementsByName("motif");
    var a = null;
    for(var i =0; i<radio.length; i++){
        if( radio[i].checked == true){
            a = radio[i]
            break;
        }
    }
    if(a == null){
        document.getElementById("messageModalReport").style.visibility= "visible";
        document.getElementById("messageModalReport").style.position = "relative";
    }else{
    
        $.ajax({
            type: 'POST',
            url: '/report/producer',
            data: {
                "idMotif": a.value,
                "idProducer": document.getElementById("idProducerReport").value,
            },
            timeout: 3000,
            success: function(data){
                if(data.code =="0"){
                    modal.style.display = "none";
                    alert("Report effectué.");
                }else{
                    modal.style.display = "none";
                    alert("Impossible d'effectuer le report.");
                }
            },
            error: function(err){
                modal.style.display = "none";
                alert("Impossible d'effectuer le report.");
            }
        });
    }
}



function loadReportProducer(idProducer){
    var html ="";
    $.getJSON("/report/producer").done(function( json ) {
        if(json){
            html+='<br /><p id="messageModalReport" style="visibility:hidden;position:absolute;color:red;">Veuillez selectionner un motif.</p><input type="hidden" value="'+idProducer+'" name="idProducer" id="idProducerReport"/><div id="radioMotif">';
            for(var i =0; i<json.length; i++){
                html+='<input type="radio" name="motif" value="'+json[i].idMotif+'" required/> '+json[i].nameMotif+' <br/>'
            }
            html+='</div><br /><button type="submit" id="submitbtn" class="btn" onclick="sendReportProducer()">Valider</button><br />'
            document.getElementById("modal-report-body").innerHTML = html;
            modal.style.display = "block";   
        }
    });
}

function sendReportProducerGroup(){
    var radio = document.getElementsByName("motif");
    var a = null;
    for(var i =0; i<radio.length; i++){
        if( radio[i].checked == true){
            a = radio[i]
            break;
        }
    }
    if(a == null){
        document.getElementById("messageModalReport").style.visibility= "visible";
        document.getElementById("messageModalReport").style.position = "relative";
    }else{
    
        $.ajax({
            type: 'POST',
            url: '/report/producerGroup',
            data: {
                "idMotif": a.value,
                "idProducerGroup": document.getElementById("idProducerGroupReport").value,
            },
            timeout: 3000,
            success: function(data){
                if(data.code =="0"){
                    modal.style.display = "none";
                    alert("Report effectué.");
                }else{
                    modal.style.display = "none";
                    alert("Impossible d'effectuer le report.");
                }
            },
            error: function(err){
                modal.style.display = "none";
                alert("Impossible d'effectuer le report.");
            }
        });
    }
}


function loadReportProducerGroup(idProducerGroup){
    var html ="";
    $.getJSON("/report/producerGroup").done(function( json ) {
        if(json){
            html+='<br /><p id="messageModalReport" style="visibility:hidden;position:absolute;color:red;">Veuillez selectionner un motif.</p><input type="hidden" value="'+idProducerGroup+'" name="idProducerGroup" id="idProducerGroupReport"/><div id="radioMotif">';
            for(var i =0; i<json.length; i++){
                html+='<input type="radio" name="motif" value="'+json[i].idMotif+'" required/> '+json[i].nameMotif+' <br/>'
            }
            html+='</div><br /><button type="submit" id="submitbtn" class="btn" onclick="sendReportProducerGroup()">Valider</button><br />'
            document.getElementById("modal-report-body").innerHTML = html;
            modal.style.display = "block";   
        }
    });
}