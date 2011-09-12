var io = require('socket.io').listen(8000);

//TODO: Database stuff
//var sqlite3 = require('sqlite3');
//var db = new sqlite3.Database('clicker.db');

//**
//Objects
//**

function client(name, id, socket){
	this.name = name;
	this.id = id;
	this.socket = socket;

	this.answer = 0;

	this.socket.on('answer', function(data){
		this.answer = data.answer;
		sessions[id].clientAnswered(name);
	});

}

function host(id, socket){
	this.id = id;
	this.socket = socket;

	this.clients = new Object();

	this.question = new question("",["","","",""],0);

	this.socket.on('new', function(data){
		this.question = data;
		for(c in clients){
			c.socket.emit('question', {prompt: this.question.prompt, answers:this.question.answers});
			c.answer = 0;
		}
	});

	this.socket.on('timesup', function(){
		for(c in clients){
			c.socket.emit('answer', {answer:this.question.correctAnswer});
		}
	});

	this.clientConnect = function(name){
		this.socket.emit('clientConnect', {name: name});
	}

	this.clientAnswered = function(name){
		this.socket.emit('clientAnswer', {name: name, answer: clients[name].answer});
	}

}

function question(prompt, answers, correctAnswer){
	this.prompt = prompt;
	this.answers = answers;
	this.correctAnswer = correctAnswer;
}

//**
//General socket events
//**

io.sockets.on('connection', function(socket){

	socket.on('sessionList', function(){
		socket.emit('list', Object.keys(sessions));
	});

	socket.on('join', function(data){
		var name = data.name;
		var id = data.id;

		if(sessions[id]){
			sessions[id].clients[name] = new client(name, id, socket);
			socket.emit('status', "connected");
		}
		else{
			socket.emit('error', "Session does not exist");
		}
	});

	socket.on('create', function(data){
		if(!sessions[id]){
			var id = data.id;
			sessions[id] = new host(id, socket);
			socket.emit('status', "connected");
		}
		else{
			socket.emit('error', "Session already exists");
		}

	});
})

var sessions = new Object();