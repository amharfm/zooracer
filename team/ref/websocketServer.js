var fs = require("fs")

var addr = require("address")
var ws = require("nodejs-websocket")
var json = require("json-file")

var lokasi_peta = "bahan/peta/";	var ekst = ".json";
var json_peta, json_npc, json_aktif, json_baru, al_json_lgkp, json_pemain, al_lkp_pmain;
var IP = addr.ip();	var IP_c;
var stat = 0;
var Dftr_pemain = [];

process.stdout.write('\033c');
console.log("===================================");
console.log("Welkommen : Zoo Racer v1");
console.log("====server:"+IP+"===========");

var	server = ws.createServer(function (conn){
	conn.sendText("http://"+IP);
	// /\:*?"<>| & { peta_ @ $ +
	conn.on("text", function(str){
		IP_c = conn.socket.remoteAddress;
		// console.log("~",conn.nama,":",str);
		if (str.slice(0,5)=="nama:"){
			al_lkp_pmain = "pemain/"+str.slice(5)+"/";
			conn.nama = str.slice(5);
			if (Dftr_pemain.length==0){
				Dftr_pemain.push(conn.nama);
				console.log(conn.nama, 'bergabung dari', IP_c);
				conn.sendText('~'+conn.nama);
			} else {
				for (var i=0; i<Dftr_pemain.length; i++){
					if (Dftr_pemain[i]!=conn.nama){
						Dftr_pemain.push(conn.nama);
						console.log(conn.nama, 'bergabung dari', IP_c);
						conn.sendText('~'+conn.nama);
						i = Dftr_pemain.length-1;
					} else if (i==Dftr_pemain.length-1) conn.sendText('~#'+conn.nama);
				}
			}
		}
		else if (str.slice(0,1)=="^"){	//MULAI BARU
			fs.exists("pemain/"+str.slice(1), function (exists){
				if (!exists){
					conn.sendText("gada")
					if (!conn.nama) conn.nama = str.slice(1);
					al_lkp_pmain = "pemain/"+conn.nama+"/";
					fs.mkdir("pemain/"+conn.nama, function (e){
						fs.open(al_lkp_pmain+'catatan.txt', 'w+', 666, function(e, id){
							fs.write(id, '', null, 'utf8', function(){fs.close(id);})
						})
					})
					Dftr_pemain.push(conn.nama);
					console.log(conn.nama, 'bergabung dari', IP_c);
				} else conn.sendText("ada");
			})
		}
		else if (str=="%"){	//CEK PEMAIN
			console.log('Pemain yang sedang bergabung:', Dftr_pemain);}
		else if (str.slice(0,5)=="peta_"){	//GANDAKAN PETA
			stat = 0;
			json_aktif = str;
			al_json_lgkp = lokasi_peta+json_aktif+ekst;
			fs.exists(al_lkp_pmain+json_aktif+ekst, function (exists){
				if(!exists){
					fs.writeFileSync(al_lkp_pmain+json_aktif+ekst, fs.readFileSync(al_json_lgkp))
				}
				conn.sendText("selamat_"+json_aktif.slice(5))
			})
		}
		else if (str.slice(0,1)=="#"){	//BATAL BUAT PEMAIN BARU
			var idx = Dftr_pemain.indexOf(conn.nama);
				Dftr_pemain.splice(idx, 1);
			fs.exists("pemain/"+conn.nama+"/"+json_aktif+ekst, function (exists){
				if(exists) fs.unlinkSync("pemain/"+conn.nama+"/"+json_aktif+ekst)
			})
			fs.exists("pemain/"+conn.nama+"/pahlawan"+ekst, function (exists){
				if(exists) fs.unlinkSync("pemain/"+conn.nama+"/pahlawan"+ekst)
			})
			fs.exists("pemain/"+conn.nama+"/npc"+ekst, function (exists){
				if(exists) fs.unlinkSync("pemain/"+conn.nama+"/npc"+ekst)
			})
			fs.exists("pemain/"+conn.nama+"/inkuiri"+ekst, function (exists){
				if(exists) fs.unlinkSync("pemain/"+conn.nama+"/inkuiri"+ekst)
			})
			fs.exists("pemain/"+conn.nama+"/qlearner"+ekst, function (exists){
				if(exists) fs.unlinkSync("pemain/"+conn.nama+"/qlearner"+ekst)
			})
			fs.exists("pemain/"+conn.nama+"/catatan.txt", function (exists){
				if(exists) fs.unlink("pemain/"+conn.nama+"/catatan.txt", function (){
					fs.rmdir("pemain/"+conn.nama, function (){delete conn.nama;})
				})
			})
		} 
		else if (str.slice(0,1)=="{"){	////SIMPAN PERJALANAN
			var json_kode = str.slice(1,2);
			var json_baru = {};
			switch (json_kode){
				default :
					var isi = JSON.parse(str);
					if (!conn.nama) conn.nama = isi["nama"];
					fs.exists("pemain/"+conn.nama+"/pahlawan"+ekst, function (exists){
						if(!exists){json_baru = new json.File("pemain/"+conn.nama+"/pahlawan"+ekst);}
						json_baru.write(function(){
							json_baru.data = isi;
							json_baru.writeSync();
							conn.sendText("slamet_"+conn.nama)
						})
					})
					var q = new json.File('qlearner'+ekst);
						q.write(function(){ q.data = [];	q.writeSync(); });
					var itm = new json.File('inkuiri'+ekst);
						itm.write(function(){ itm.data = [];	itm.writeSync(); });
					break;
				case 'o' :	//o				pahlawan
					var isi_o = JSON.parse(str.slice(2));
					if (!conn.nama) conn.nama = isi_o["nama"];
					fs.exists("pemain/"+conn.nama+"/pahlawan"+ekst, function (exists){
						if(!exists){json_baru = new json.File("pemain/"+conn.nama+"/pahlawan"+ekst);}
						else {
							json_baru = json.read("pemain/"+conn.nama+"/pahlawan"+ekst);
							json_baru.write(function(){
								json_baru.data = isi_o;
								json_baru.writeSync();
								conn.sendText("slamet_"+conn.nama)
							})
						}
					})
					break;
				case 'n' :	//n	npc			npc
					var isi_n = JSON.parse(str.slice(2));
					fs.exists("pemain/"+conn.nama+"/npc"+ekst, function (exists){
						if(!exists){json_npc = new json.File("pemain/"+conn.nama+"/npc"+ekst);}
						else {
							json_npc = json.read("pemain/"+conn.nama+"/npc"+ekst);
							json_npc.write(function(){
								json_npc.data = isi_n;
								json_npc.writeSync();
							})
						}
					})
					break;
				case 'p' :	//p9_ atau p99_	peta
					var nopeta = str.slice(2,(str.indexOf('_')));
					var isi_p = JSON.parse(str.slice((str.indexOf('_'))+1));
					fs.exists("pemain/"+conn.nama+"/peta_"+nopeta+ekst, function (exists){
						if(!exists){json_baru = new json.File("pemain/"+conn.nama+"/peta_"+nopeta+ekst);}
						else {
							json_baru = json.read("pemain/"+conn.nama+"/peta_"+nopeta+ekst);
							json_baru.write(function(){
								json_baru.data = isi_p;
								json_baru.writeSync();
							})
						}
					})
					break;
				case 'i' :	//{i[{},...]	inkuiri
					var isi_i = JSON.parse(str.slice(2));
					fs.exists("pemain/"+conn.nama+"/inkuiri"+ekst, function (exists){
						if(!exists){json_baru = new json.File("pemain/"+conn.nama+"/inkuiri"+ekst);}
						else {
							json_baru = json.read("pemain/"+conn.nama+"/inkuiri"+ekst);
							json_baru.write(function(){
								json_baru.data = isi_i;
								json_baru.writeSync();
							})
						}
					})
					break;
				case 'q' :	//{q[[{}],...]	qlearner
					var isi_q = JSON.parse(str.slice(2));
					fs.exists("pemain/"+conn.nama+"/qlearner"+ekst, function (exists){
						if(!exists){json_baru = new json.File("pemain/"+conn.nama+"/qlearner"+ekst);}
						else {
							json_baru = json.read("pemain/"+conn.nama+"/qlearner"+ekst);
							json_baru.write(function(){
								json_baru.data = isi_q;
								json_baru.writeSync();
							})
						}
					})
					break;
				case 'h' :	//{h[[{}],...]	hipotesis
					var isi_h = JSON.parse(str.slice(2));
					fs.exists("pemain/"+conn.nama+"/hipotesis"+ekst, function (exists){
						if(!exists){json_baru = new json.File("pemain/"+conn.nama+"/hipotesis"+ekst);}
						else {
							json_baru = json.read("pemain/"+conn.nama+"/hipotesis"+ekst);
							json_baru.write(function(){
								json_baru.data = isi_h;
								json_baru.writeSync();
							})
						}
					})
					break;
				console.log("~",conn.nama,"menyimpan Perjalanan");
			}
		}
		else if (str.slice(0,1)=="&"){	//LANJUT PERJALANAN
			if (Dftr_pemain.length==0){
				fs.exists("pemain/"+str.slice(1), function (exists){
					if (!exists){conn.sendText("gada_f");}
					 else {
						if (!conn.nama) conn.nama = str.slice(1);
						json_pemain = json.read("pemain/"+conn.nama+"/pahlawan"+ekst);
						fs.readdir("pemain/", function(err, files){
							for (var i=0; i<files.length; i++){
								if (files[i]==str.slice(1)){
									if (stat==0){
										conn.sendText("ada_f");
										stat = 1;
									}
									i = files.length-1;
								} else {if (i==files.length-1){conn.sendText("gada_f");}}
							}
						})
						console.log("~",conn.nama,"melanjutkan Perjalanan");
					 }
				})
			} else {
				for (var j=0; j<Dftr_pemain.length; j++){
					if (Dftr_pemain[j]!=str.slice(1)){
						fs.exists("pemain/"+str.slice(1), function (exists){
							if (!exists){conn.sendText("gada_f")}
							 else {
								fs.readdir("pemain/", function(err, files){
									for (var i=0; i<files.length; i++){
										if (files[i]==str.slice(1)){
											if (stat==0){
												if (!conn.nama) conn.nama = str.slice(1);
												conn.sendText("ada_f");
												json_pemain = json.read("pemain/"+conn.nama+"/pahlawan"+ekst);
												stat = 1;
											}
											i = files.length-1;
										} else {if (i==files.length-1){conn.sendText("gada_f");}}
									}
									j = Dftr_pemain.length;
								})
							 }
						})
					} else {
						if (j==Dftr_pemain.length-1) conn.sendText('~#'+conn.nama);
					}
				}
			}
		}
		else if (str.slice(0,1)=="+"){	//MUAT NPC
			json_aktif = str.slice(1);
			json_npc = lokasi_peta+json_aktif+ekst;
			fs.exists(al_lkp_pmain+json_aktif+ekst, function (exists){
				if(!exists){
					fs.writeFileSync(al_lkp_pmain+json_aktif+ekst, fs.readFileSync('bahan/data/npc'+ekst))
				}
				conn.sendText(str)
			})
		}
		else if (str.slice(0,1)=="-"){	//TANYA GURU
			var pengirim = conn.nama;
			var pesan = str.slice(1);
			server.connections.forEach(function (conn){conn.sendText('@'+pengirim+'#'+pesan);})
			console.log("~",conn.nama,"bertanya tentang",pesan.slice(0,10));
		}
		else if (str.slice(0,4)=="cat:"){	//BACA CATATAN
			fs.readdir("sumbel/", function(err, files){
				if (err) throw err;
				conn.sendText('cat:'+JSON.stringify(files));
			})
		}
		else if (str.slice(0,6)=="s_cat:"){	//SIMPAN CATATAN
			var isi_cat = str.slice(6);
				fs.open(al_lkp_pmain+'catatan.txt', 'w+', 666, function(e, id){
					fs.write(id, isi_cat, null, 'utf8', function(){
						fs.close(id, function(){
							conn.sendText("s_cat:"+isi_cat);
						})
					})
					console.log("~",conn.nama,"menyimpan Catatan");
				})
		}
		else if (str.slice(0,3)=='bc+'){	//BROADCAST
			server.connections.forEach(function(e){e.sendText('bc+'+str.slice(3));});
			console.log("~","Anda mengirim broadcast pada murid-murid");
		}
	});
	conn.on("close", function (code, reason){
		if (Dftr_pemain.length>0){
			console.log(conn.nama, "pergi..");
			var idx = Dftr_pemain.indexOf(conn.nama);
			Dftr_pemain.splice(idx, 1);
			console.log('Pemain yang tersisa:', Dftr_pemain);
		}
	});
	conn.on("error", function (err){console.log("#### Ups, error. Biar kami ulangi ####");});
}).listen(8989)
