//**
//Form handlers
//**

$("#create").click(function(){
	var id = $("#id").val();
	socket.emit('create', {id: id});
});

$("#new").click(function(){
	console.log("new click");
	var prompt = $("#prompt").val();
	var a1 = $("#a1").val();
	var a2 = $("#a2").val();
	var a3 = $("#a3").val();
	var a4 = $("#a4").val();
	var correct = $("#correct").val();

	socket.emit('new', {prompt: prompt, answers: [a1,a2,a3,a4], correctAnswer: correct});

	for(c in clients){
		$("#"+c).html(c+":");
	}
	
	$("#responses").html = "";
	done = false;
});

$("#end").click(function(){
	done = true;
	socket.emit('timesup');
});

//**
//Socket.io conenction and events
//**

var socket = io.connect("http://" + window.location.hostname + ":8000");

socket.on('status', function(data){
	if(data == "connected"){
		$("#connect").hide();
	}
});

socket.on('error', function(data){
	alert(data);
});

socket.on('clientConnect', function(data){
	clients[data.name] = data;
	$("#responses").append("<div id="+data.name+">"+data.name+": </div><br />");
});

socket.on('clientDisconnect', function(data){
	delete clients[data.name];
	$("#"+data.name).remove();
});

socket.on('clientAnswer', function(data){
	console.log(data);
	if(!done){
		$("#"+data.name).html(data.name + ": " + data.answer);
	}
});
	


var done = true;

var clients = new Object();