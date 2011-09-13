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

	//**
	//Callback functions
	//**
	this.answerCallback = function(parent, data){
		parent.answer = data.answer;
		sessions[parent.id].clientAnswered(parent.name, parent.answer);
	}
	this.disconnectedCallback = function(parent, data){
		sessions[parent.id].clientDisconnect(parent.name);
		delete sessions[parent.id].clients[parent.name];
	}

	//**
	//Socket Events
	//**
	this.socket.on('answer', partial(this.answerCallback, this));
	this.socket.on('disconnect', partial(this.disconnectedCallback, this));

}

function host(id, socket){
	console.log("new host");
	console.log(socket);
	this.id = id;
	this.socket = socket;

	this.clients = new Object();

	this.question = new question("",["","","",""],0);


	this.clientConnect = function(name){
		this.socket.emit('clientConnect', {name: name});
		this.clients[name].socket.emit('question', {prompt: this.question.prompt, answers: this.question.answers});
	}

	this.clientDisconnect = function(name){
		this.socket.emit('clientDisconnect', {name: name});
	}

	this.clientAnswered = function(name, answer){
		this.socket.emit('clientAnswer', {name: name, answer: answer});
	}

	this.newCallback = function(parent, data){
		console.log("new");
		parent.question = data;
		for(c in parent.clients){
			parent.clients[c].socket.emit('question', {prompt: parent.question.prompt, answers:parent.question.answers});
			parent.clients[c].answer = 0;
		}
	}

	this.timesupCallback = function(parent){
		console.log("timesup");
		for(c in parent.clients){
			parent.clients[c].socket.emit('answer', {answer:parent.question.correctAnswer});
		}
	}

	this.disconnectCallback = function(parent, data){
		for(c in parent.clients){
			parent.clients[c].socket.emit('error', "Session ended");
		}
		delete sessions[parent.id];
	}

	//**
	//Socket Events
	//**
	this.socket.on('new', partial(this.newCallback, this));
	this.socket.on('timesup', partial(this.timesupCallback, this));
	this.socket.on('disconnect', partial(this.disconnectCallback, this));


}

function question(prompt, answers, correctAnswer){
	this.prompt = prompt;
	this.answers = answers;
	this.correctAnswer = correctAnswer;
}


function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
	var allArguments = args.concat(Array.prototype.slice.call(arguments));
	return func.apply(this, allArguments);
	};
}

//**
//General socket events
//**

io.sockets.on('connection', function(socket){

	socket.on('sessionList', function(){
		socket.emit('list', Object.keys(sessions));
	});

	socket.on('join', function(data){
		var name = data.name.replace(/ /g,'_');
		var id = data.id;

		if(sessions[id]){
			sessions[id].clients[name] = new client(name, id, socket);
			socket.emit('status', "connected");
			sessions[id].clientConnect(name);
		}
		else{
			socket.emit('error', "Session does not exist");
		}
	});

	socket.on('create', function(data){
		var id = data.id;
		if(!sessions[id]){
			sessions[id] = new host(id, socket);
			socket.emit('status', "connected");
		}
		else{
			socket.emit('error', "Session already exists");
		}

	});
});

var sessions = new Object();
