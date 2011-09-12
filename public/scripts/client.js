//**
//Form handlers
//**

$("#join").click(function(){
	var id = $("#id").val();
	var name = $("#name").val();
	socket.emit('join', {id: id, name: name});
});

$("#submit").click(function(){
	var answer = $("input:radio[name=answer]:checked").val();
	socket.emit('answer', {answer: answer});
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

socket.on('question', function(data){
	console.log("Got question");
	$("#prompt").val(data.prompt);
	$("#a1").val(data.answers[0]);
	$("#a2").val(data.answers[1]);
	$("#a3").val(data.answers[2]);
	$("#a4").val(data.answers[3]);
	$("#correctAnswer").html("");
});

socket.on('answer', function(data){
	$("#correctAnswer").html("Correct Answer: " + data.answer);
});