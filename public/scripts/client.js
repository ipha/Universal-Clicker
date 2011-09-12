//**
//Form handlers
//**

$("#join").click(function(){
	var id = $("#id").val();
	var name = $("#name").val();
	socket.emit('create', {id: id, name: name});
});

$("#submit").click(function(){
	var answer = $("#answer").val();
	socket.emit('answer', {answer: answer});
});

//**
//Socket.io conenction and events
//**

var socket = io.connect("http://iphawrt.dyndns.org:8000");

socket.on('status', function(data){
	if(data == "connected"){
		$("#connect").hide();
	}
});

socket.on('error', function(data){
	alert(data);
});

socket.on('question', function(data){
	$("#prompt").value = data.prompt;
	$("#a1").value = data.answeres[0];
	$("#a2").value = data.answeres[1];
	$("#a3").value = data.answeres[2];
	$("#a4").value = data.answeres[3];
	$("#correctAnswer").html = "";
});

socket.on('answer', function(data){
	$("#correctAnswer").html = "Correct Answer: " + data.answer;
});