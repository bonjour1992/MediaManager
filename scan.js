var config = require('./config.js')
	var db = require('./db/mysql.js')
	var tmdb = require('./tmdb.js')
	
	var processor 
var to_process =[]
var type ="movie"


exports.scan = scan_file
	
	
function scan_file() {
	get_movie_list(compare_to_db)

}


function get_movie_list(cb) {
	var spawn = require('child_process').spawn
		var child = spawn("ls", ["-l", config.movie_folder])
		var resp = "";

	child.stdout.on('data', function (buffer) {
		resp += buffer.toString()
	});
	child.stdout.on('end', function () {
		cb(parse_movie_list(resp))
	});
}

function parse_movie_list(data) {
	data = data.split("\n")
		var res = []
		for (var i in data) {
			var l = data[i]
				if (config.video_file.indexOf(l.substring(l.length - 4)) >= 0) {
					var o = {
						file : l.substring(53),
						folder : "/Films/",
						size : +l.substring(25, 37)
					}
					res.push(o)
				}
		}
		return res
}

function compare_to_db(list) {
	db.get_files_list(function (res) {
		
		for (var i in list) {
			if (res.indexOf(list[i].file + "#" + list[i].size) < 0) {

				to_process.push(list[i])
			}
		}
		processor = setInterval(search,5000)
	}) 

}

function search() {
	var f= to_process.splice(0, 1)[0]
	if (f)
	{
	tmdb.search("movie", get_title(f.file), get_year(f.file), function (id) {db.save_file("movie",id,f,false,function (res) {console.log(f.file)})}, function (res) {
		db.log("scanner","unrecognized file " + f.file)	
	})
	}
	else
	{
		clearInterval(processor)
		scan_db()
	}
}


function scan_db()
{
	db.get_list_missing("movie",function(res)
	{
		to_process=res
		processor = setInterval(process,5000)
	})
}


function process() {
	var id=to_process.splice(0, 1)[0]
	if (id)
	{
		id=id.id
		tmdb.query("movie/" + id, config.append.movie, function (res) {
			db.save("movie", res)
		}, console.log)
	}
	else
	{
		clearInterval(processor)
	}
	

}



function get_title(s) {
	return s.substring(0, s.lastIndexOf(".") - 7)
}

function get_year(s) {
	return s.substring(s.lastIndexOf(".") - 5, s.lastIndexOf(".") - 1)
}


