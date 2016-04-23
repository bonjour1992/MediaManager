var fs = require('fs');
var path = require('path');
var config = require('./config.js')
	var db = require('./db/mysql.js')
	
	var res 
	var walk = function (dir, done) {
	var results = [];
	fs.readdir(dir, function (err, list) {
		if (err)
			return done(err);
		var pending = list.length;
		if (!pending)
			return done(null, results);
		list.forEach(function (file) {
			file = path.resolve(dir, file);
			fs.stat(file, function (err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function (err, res) {
						results = results.concat(res);
						if (!--pending)
							done(null, results);
					});
				} else {
					results.push({file:file,size:stat.size});
					if (!--pending)
						done(null, results);
				}
			});
		});
	});
};


function save_music(i){
	db.save_file("song",i.id,i)
	db.save("song",i)
}

walk(config.music_folder, function(err, results) {
if (err) throw err;
res=results
setInterval(process,300)
	

})

function process()
{
	var f= res.splice(0, 1)[0]
	eyed3(f,save_music)
}
function parse(results) {
	var parsed = []

}

function run_cmd(cmd, args, callBack) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = "";

	child.stdout.on('data', function (buffer) {
		resp += buffer.toString()
	});
	child.stdout.on('end', function () {
		callBack(resp)
	});
}

function eyed3(f, cb) {
	run_cmd("eyeD3", [f.file, "--color"], function (res) {
		console.log(res)
		var info = {
			file :  f.file.substring(f.file.lastIndexOf("/") + 1),
			folder :  f.file.substring(config.music_folder.length-6,f.file.lastIndexOf("/") +1),
			size : f.size
		}
		res = res.replace(/1m/g, ' ').replace(/0m/g, ' ').replace(/[^a-z0-9 ,.?!\n /-]/ig, '').split("\n")
			for (var i in res) {

				if (res[i].indexOf('title') >= 0) {
					info.title = res[i].substring(8, res[i].lastIndexOf('artist') - 1)
					info.artist = res[i].substring( res[i].lastIndexOf('artist')+8)
				}
				if (res[i].indexOf('album') >= 0 &&res[i].indexOf('year') >= 0) {
					info.album = res[i].substring(8, res[i].lastIndexOf('year') - 1)
					info.year = res[i].substring( res[i].lastIndexOf('year') +6)
				}
				if (res[i].indexOf('track') >= 0 && res[i].indexOf('/') >= 0  ) {
					info.track = res[i].substring(8, res[i].indexOf('/') )
				}
				if (res[i].indexOf('genre') >= 0 )
				{
					info.genre = res[i].substring( res[i].lastIndexOf('genre') +7 ,res[i].indexOf('id')-1)
					info.genre_id= res[i].substring(res[i].indexOf('id')+3)
				}
				if (res[i].indexOf('disc') >= 0 ) {
					info.disc= res[i].substring(7, res[i].indexOf('/') )
				}				
				if (res[i].indexOf('Description MusicBrainz Album Id') >= 0) {

					info.album_id = res[+i + 1]
				}
				if (res[i].indexOf('Description MusicBrainz Album Artist Id') >= 0) {

					info.artist_id = res[+i + 1]
				}
				if (res[i].indexOf('Unique File ID  http//musicbrainz.org') >= 0) {
					info.id = res[i].substring(39)
				}

			}
			cb(info)
	});
}

