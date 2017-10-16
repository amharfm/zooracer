var http = require("http"),
	fs = require("fs"),
	ws = require("nodejs-websocket"),
	addr = require("address"),
	Stopwatch = require("node-stopwatch").Stopwatch,
	canvasPixelColor = require("canvas-pixel-color"),
	uniqid = require('uniqid');

var stopwatch = Stopwatch.create();

var server = ws;
	server.IP = addr.ip() || "localhost";

var Race = {};
var Animals = [];
var player_list = [];
var Tracks = [];

const port = 7223;

process.stdout.write('\033c');
console.log("===================================");
console.log("Welkommen: Zoo Racer v1");
console.log("[web] http://"+server.IP+"/zooracer");
console.log("===================================");

server = ws.createServer(function (conn){
	conn.on("text", function(str){
		if (str){
			var obj = JSON.parse(str);
			// console.log('\n'+obj.to)
			switch (obj.to){
				case 'login' :
					fs.readdir('animals/', function (err, files) {
						if (err) throw err;
						if (Animals.length<1){
						  	files.forEach(function(f){
						  		if (f.split('.')[1]=='ico') Animals.push(f.split('.')[0])
						  	})
						}
					  	conn.socket.uniqid = uniqid.process();
						console.log(conn.socket.uniqid, 'has joined as', obj.what);
						Race[conn.socket.uniqid] = {'x':250, 'y':250, 'addr':conn.socket.remoteAddress, 'name':obj.what, 'stay':false};
						conn.send(JSON.stringify({
							'to': 'login_ok',
							'who': obj.what,
							'id': conn.socket.uniqid
						}))
						// console.log(Race)
					});
				break;
				case 'stay' :
					Race[conn.socket.uniqid]['stay'] = obj.stat;
					break;
				case 'get animals':
					conn.socket.uniqid = obj.id;
					conn.send(JSON.stringify({
						'to': 'get animals',
						'list_anim': Animals
					}))
					break;
				case 'kuy!':
					conn.socket.uniqid = obj.id;
					conn.send(JSON.stringify({
						'to': 'kuy!',
						'who' : obj.who,
						'animal' : Race[obj.id]['animal']
					}))
					break;
				case 'join the race' :
					conn.socket.uniqid = obj.id;
					conn.send(JSON.stringify({
						'to': 'start',
						'animal' : Race[obj.id]['animal'],
						'track': obj.track
					}))
					Race[obj.id]['track'] = obj.track;
					break;
				case 'choose player':
					conn.socket.uniqid = obj.id;
					console.log(obj.id, 'chooses', obj.animal);
					Animals.splice(Animals.indexOf(obj.animal), 1);
					server.connections.forEach(function(e){
						e.send(JSON.stringify({
							'to': 'animal is chosen',
							'animal': obj.animal,
							'list_anim': Animals
						}))
					})
					Race[obj.id]['animal'] = obj.animal;
					conn.send(JSON.stringify({
						'to': 'yuk!',
						'who' : obj.who,
						'animal' : obj.animal
					}))
					break;
				case 'ngiuung':
					conn.socket.uniqid = obj.id;
					Race[obj.id]['x'] = obj.pos.x;
					Race[obj.id]['y'] = obj.pos.y;
					//broadcast
					server.connections.forEach(function(c){
						c.send(JSON.stringify({
							'to': 'ngioong',
							'who': conn.socket.uniqid,
							'anim': Race[obj.id]['animal'],
							'cmd' : obj.cmd,
							'list': Race
						}));
					});
					break;
				case 'okletsgo':
					if (Race[obj.id]){
						conn.socket.uniqid = obj.id;
						conn.send(JSON.stringify({
							'to': 'okletsgo',
							'id': obj.id,
							'animal': Race[obj.id]['animal'],
							'list': Race,
							'curr_track': Race[obj.id]['track']
						}));
					}
					break;
				case 'get mazes':
					fs.readdir('img/track/', function (err, files) {
						if (err) throw err;
						if (Tracks.length<1){
							files.forEach(function(f){
						  		if (f.split('.')[1]=='bmp' || f.split('.')[1]=='jpg' || f.split('.')[1]=='jpeg' || f.split('.')[1]=='png')
						  		 Tracks.push(f)
						  	})
						}
					  	conn.send(JSON.stringify({
							'to': 'get mazes',
							'tracks': Tracks
						}))
					});
					break;
				case 'finishes/fails':
					server.connections.forEach(function(c){
						c.send(JSON.stringify({
							'to': 'succeed/failed',
							'id': obj.id,
							'who': Race[obj.id]['name'],
							'how': obj.how,
							'where': Race[obj.id]['track']
						}))
					});
				default :
					// console.log('~',obj)
					break;
			}
			// console.log(Race);
		}
	})
	conn.on("close", function(code, reason){
		console.log('\n CLOSE',code,reason)
		server.connections.forEach(function(c){
			c.send(JSON.stringify({
				'to': 'remove player',
				'id': conn.socket.uniqid
			}))
		})
		if(conn.socket.uniqid) if (!Race[conn.socket.uniqid]['stay']) delete Race[conn.socket.uniqid];
		// console.log(Race);
	})
	conn.on("error", function(err){})
}).listen(port);
