var Player = {};

var WS = new WebSocket("ws://"+window.location.hostname+":7223");
	WS.onopen = function (e){
		console.info('Zoogo Racer')
	};
	WS.onclose = function (e){
		console.warn(e);
		if (document.getElementById('main')) document.getElementById('main').parentNode.removeChild(document.getElementById('main'))
				else document.write('~');
		document.body.appendChild(document.createElement('div')).id = 'alert'
		document.getElementById('alert').innerHTML = "<a style='color:black;' href='"+window.location.origin+"/zooracer'><h1>error</h1></a>";
		document.getElementById('alert').align = "center";
		alertify.error('error');
	};
	WS.onerror = function (err){
		alertify.error("Error. Check the server");
	};
	WS.onmessage = function (event){
		var obj = JSON.parse(event.data)
		// console.log(obj);
		switch (obj.to){
			case 'login_ok':
				alertify.notify('Hello, '+obj.who);
				Game.stat(obj.id, true);
				window.location.href = window.location.href + 'instructions.html#'+obj.id;
				break;
			case 'yuk!' :
				localStorage.setItem('animal', obj.animal);
				window.animal = localStorage.getItem('animal');
				Game.ready(obj.animal);
				break;
			case 'animal is chosen':
				if (document.getElementById(obj.animal)) document.getElementById(obj.animal).parentNode.removeChild(document.getElementById(obj.animal));
				Game.animals = obj.list_anim;
				break;
			case 'ngioong' : 
				for (var anim in obj.list){
					if (window.location.pathname=="/zooracer/race.html") if (obj.list[anim].track.split('.')[0]==document.getElementsByTagName('h1')[0].innerText){
						if (window.location.hash.slice(1)==obj.who && obj.who==anim && anim==window.location.hash.slice(1)){
							run(25,true);
							Game.sense();
							code.value = '';
						} else {
							if (anim!=window.location.hash.slice(1)){
								// console.warn('opp', anim, 'is updated')
								if (!document.getElementById('em_'+anim)){
									document.getElementsByClassName('inner')[1].insertBefore(document.createElement('div'), document.getElementsByClassName('inner')[1].children[0]).id = anim;
						        	document.getElementById(anim).setAttribute('style', "opacity:0.3;");
						        	document.getElementById(anim).appendChild(document.createElement('img')).id = 'em_'+anim;
							        document.getElementById('em_'+anim).setAttribute("src", "animals/"+obj.list[anim]['animal']+".ico");
							        document.getElementById('em_'+anim).setAttribute("width", "20");
							        document.getElementById('em_'+anim).setAttribute("height", "20");
						        	document.getElementById('em_'+anim).setAttribute('style', 'position:absolute; transform:rotate(270deg);');
								}
								// var x_ = (parseFloat(obj.list[anim]['x']))+13;
								var x_ = (parseFloat(obj.list[anim]['x']))+document.getElementsByClassName('inner')[1].offsetLeft-10;
								var y_ = (parseFloat(obj.list[anim]['y']))+87;
								document.getElementById('em_'+anim).style.left = x_+'px';
								document.getElementById('em_'+anim).style.top = y_+'px';
							}
						}
					}
				}
				break;
			case 'start' : 
				Game.start(obj.animal);
				break;
			case 'kuy!':
				Game.priiit(obj.animal);
				break;
			case 'get animals':
				Game.stat(obj.id, false);
				Game.animals = obj.list_anim;
				document.getElementById('animals').scrollIntoView();
		        for (var tr=0; tr<5; tr++){
		          document.getElementById('anim_list').appendChild(document.createElement('tr')).id = 'tr_'+tr;
		          for (var td=0; td<10; td++){
		            if (Game.animals[Game.anim_num]){
		              document.getElementById('tr_'+tr).appendChild(document.createElement('td')).id = 'tr_'+tr+'_td_'+td;
		              document.getElementById('tr_'+tr+'_td_'+td).appendChild(document.createElement('img')).id = Game.animals[Game.anim_num];
		              document.getElementById(Game.animals[Game.anim_num]).src = 'animals/'+Game.animals[Game.anim_num]+'.ico';
		              document.getElementById(Game.animals[Game.anim_num]).width = "48";
		              document.getElementById(Game.animals[Game.anim_num]).setAttribute('onclick',"Game.choose_player(this)");
		              document.getElementById(Game.animals[Game.anim_num]).style.transform = 'rotate(270deg)';

		              Game.anim_num++;
		            }
		          }
		        }
				break;
			case 'okletsgo' : 
				Game.okletsgo(obj.animal, obj.curr_track);
				Game.stat(window.location.hash.slice(1), false);
				break;
			case 'get mazes' :
				obj.tracks.forEach(function(t){
					document.getElementById('drop_maze').appendChild(document.createElement('option')).id = t;
					document.getElementById(t).value = t/*.split('.')[0]*/;
					document.getElementById(t).innerText = t.split('.')[0];
				})

				Game.what_maze = function(){
				 return document.getElementById('drop_maze').selectedOptions[0].value;
				}

				Game.drop_maze.onchange = function(){
					document.getElementById('but_start').setAttribute('onclick', "Game.join('"+Game.what_maze()+"')");
				};

				document.getElementById('but_start').setAttribute('onclick', "Game.join('"+Game.what_maze()+"')");
				break;
			case 'remove player':
				if (document.getElementById('em_'+obj.id)){
					document.getElementById('em_'+obj.id).parentNode.removeChild(document.getElementById('em_'+obj.id))
				}
				break;
			case 'succeed/failed':
				var msg;
				if (obj.where.split('.')[0]==document.getElementsByTagName('h1')[0].innerText)
				switch (obj.how){
					case 'finish' :
						msg = "F I N I S H !"
						if (obj.id==window.location.hash.slice(1)){
							alertify.success('C O N G R A T U L A T I O N S!');
							document.getElementById('main').parentNode.removeChild(document.getElementById('main'))
							document.body.appendChild(document.createElement('div')).id = 'hurray'
							document.getElementById('hurray').innerHTML = "<h1>"+msg+"</h1>";
							document.getElementById('hurray').align = "center";

							var wait = setInterval(function(){
								window.location.href = window.location.origin + '/zooracer';
								clearInterval(wait);
							}, 5000)
						} else {
							alertify.notify(obj.who+' finishes the Race!');
						}
						break;
					case 'fail' :
						msg = "G A M E  O V E R !"
						if (obj.id==window.location.hash.slice(1)){
							alertify.error('G A M E  O V E R');
							document.getElementById('main').parentNode.removeChild(document.getElementById('main'))
							document.body.appendChild(document.createElement('div')).id = 'hurray'
							document.getElementById('hurray').innerHTML = "<h1>"+msg+"</h1>";
							document.getElementById('hurray').align = "center";

							var wait = setInterval(function(){
								window.location.href = window.location.origin + '/zooracer';
								clearInterval(wait);
							}, 5000)
						} else {
							alertify.notify(obj.who+' is out of the Race!');
						}
						break;
				}
				break;
			default :
				console.warn(999)
				break;
		}
	};

var Game = {
	"hand":9090,
	'maxMovem' : 360,
	'anim_num' : 0,
	'animals' : [],
	'alertCounter' : 0,
	'send' : function(o){
		WS.send(JSON.stringify(o))
	},
	'stat' : function(id, stat){
		Game.send({
			'to' : 'stay',
			'id' : id,
			'stat': stat
		})
	},
	'sign' : function(){
		var wait = setInterval(function(){
			if (WS.readyState==1){
				clearInterval(wait);
				Game.send({
					'to': 'okletsgo',
					'id': window.location.hash.slice(1)
				});
			}
		}, 1000);
		document.getElementById('code').focus();
	},
	'okletsgo': function (animal,track){
		var em = document.getElementById('sprite');
            em.style.position = "relative";
            em.src = "animals/"+animal+".ico";
        document.getElementById('turtle').appendChild(em);
        document.getElementsByTagName('h1')[0].innerText = track.split('.')[0];
        document.getElementsByTagName('h1')[0].innerHTML = "<a style='color:black;' href='"+window.location.origin+"/zooracer'>"+document.getElementsByTagName('h1')[0].innerHTML+"</a>";
        init('canvas','turtle','input','oldcode', 'textOutput'); 
		clearcanvas(track); 
		run(1,true); 
	},
	'update_pos' : function(){

	},
	'join' : function(m){
		Game.send({
			'to': 'join the race',
			'animal' : localStorage.getItem('animal'),
			'id': window.location.hash.slice(1),
			'track': Game.what_maze()
		})
	},
	'priiit' : function (animal){
		console.info(animal)
	},
	'start' : function (animal){
		Game.stat(window.location.hash.slice(1), true);
		window.location.href = window.location.origin+'/zooracer/race.html'+window.location.hash;
	},
	'ready' : function(a){
		document.getElementById('animals').parentNode.removeChild(document.getElementById('animals'));
		document.getElementById('instruction').parentNode.removeChild(document.getElementById('instruction'))
		var centah = document.createElement('center');
			document.body.appendChild(centah);
		var pic = document.createElement('img');
			pic.setAttribute('id', 'sel_pl');
			pic.setAttribute('style', "align:'center'; transform:rotate(270deg);");
			pic.setAttribute('src', 'animals/'+animal+'.ico');
			pic.setAttribute('sty', 'animals/'+animal+'.ico');

			centah.appendChild(pic);
			centah.appendChild(document.createElement('br'));
			Game.drop_maze = document.createElement('select');
			Game.drop_maze.id = 'drop_maze';
			centah.appendChild(Game.drop_maze)
			centah.appendChild(document.createElement('br'))
			Game.send({'to': 'get mazes'});
		var but_start = document.createElement('button');
			but_start.id = 'but_start';
			but_start.innerHTML = 'START';
			centah.appendChild(but_start);
	},
	'choose_player' : function (i){
		alertify.confirm('Are you sure you choose '+i.id+'?', function(ok){
			if (ok){
				Game.send({
					'to': 'choose player',
					'animal': i.id,
					'id': window.location.hash.slice(1)
				})
			}
		})
	},
	'login' : function() {
		if (document.getElementById('player_name')){
			Player.name = document.getElementById('player_name').value;
			if (Player.name=="" || Player.name.length<4){
				alertify.notify('Name must be at least 4 alpha/numeric characters');
				Player.name = '';
			} else {
				Game.send({
					'to': 'login', 'what': Player.name
				});
			}
		}
		
	},
	'color' : {
		'track' : '#ffffff',
		'goal' : '#00ff00',
		'fence' : '#000000',
	},
	'sense' : function (){
		if (!step_detector){
			var step_detector = setInterval(function(){
				var color_now = canvasPixelColor({
					'x':parseFloat(turtle.turtle.x), 
					'y':parseFloat(turtle.turtle.y)}, 
					canvas.getContext('2d')
				);
				switch(color_now.hex){
					case Game.color.track :
						// console.info('ok')
						break;
					case Game.color.goal :
						clearInterval(step_detector);
						if (Game.alertCounter==0){
							Game.send({
								'to': 'finishes/fails',
								'how': 'finish',
								'id': window.location.hash.slice(1)
							})
						}
						Game.alertCounter++;
						break;
					case Game.color.fence :
						clearInterval(step_detector);
						if (Game.alertCounter==0){
							Game.send({
								'to': 'finishes/fails',
								'how': 'fail',
								'who': Player.name,
								'id': window.location.hash.slice(1)
							})
						}
						Game.alertCounter++;
						break;
					default :
						// console.log('%c ____ ', 'background: '+color_now.hex+'; color: '+color_now.hex);
						break;
				}
			}, 100)
		}
	},
	'init' : function() {
		code.onkeyup = function(event){
			if(event.keyCode==13){
				Game.send({
					'to': 'ngiuung',
					'id' : window.location.hash.slice(1),
					'cmd' : code.value,
					'pos' : {
						'x': turtle.turtle.x,
						'y': turtle.turtle.y
					}
				})
			}
		}
		code.focus();
		this.login();
	},
	'eval' : function (code){
		code.split(' ').forEach(function(e){
			if(isFinite(e)){
				if (e<=Game.maxMovem) {
					run(25,true);
					code.value = '';
				} else {
					alertify.notify('Max movement & degree is '+Game.maxMovem)
					code.value = '';
				}
			}
		})
	},
	'reset' : function (){
		if (localStorage.getItem('animal')) localStorage.removeItem('animal');
		if (localStorage.getItem('name')) localStorage.removeItem('name');
	}
}

Game.reset();

alertify.set({
	buttonReverse:true
	,labels: {
		ok     : "Yes",
		cancel : "No"
	}
});
alertify.notify = alertify.extend("custom");