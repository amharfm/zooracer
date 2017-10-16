var io = require('socket.io')(84);
io.on('connection', function(socket){
  console.log('a user connected');
});

io.on('login', function(data){
	console.log("done")
});