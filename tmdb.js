var config = require('./config.js');
var http = require('http');

module.exports = {
	query : function (main, append, success, failure) {
		//console.log("call to tmdb :  http://api.themoviedb.org/3/" + main + "?api_key=" + config.tmdb_key + "&append_to_response=" + append)
		var req = http.request({
			hostname : "api.themoviedb.org",
			port : 80,
			path : "/3/" + main + "?api_key=" + config.tmdb_key + "&append_to_response=" + append,
			method : "GET"
		}, function (res) {
			var st = '';
			res.on('data', function (chunk) {
				st += chunk;
			});
			res.on('end', function () {
				var data = JSON.parse(st)
				if (data.id)
				{
					success(data)
				}
				else{
					failure("id not found "+main)
				}
			});
		});
		req.on("error", function (e) {
			failure(e.message);
		});
		req.end();
	},
	search : function (type, title, year, success, failure) {
		//console.log("call to tmdb :  http://api.themoviedb.org/3/search/" + type + "?api_key=" + config.tmdb_key + "&query=" +encodeURIComponent (title) + "&year=" + year)
		var req = http.request({
			hostname : "api.themoviedb.org",
			port : 80,
			path : "/3/search/" + type + "?api_key=" + config.tmdb_key + "&query=" +encodeURIComponent( title) +  "&year=" + year,
			method : "GET"
		}, function (res) {
			var st = '';
			res.on('data', function (chunk) {
				st += chunk;
			})
			res.on('end', function () {
				var res = JSON.parse(st)
				if (res.results && res.results.length>0) {
					success(res.results[0].id)
				} else {
					failure("no result")
				}
			})
		});
		req.on("error", function (e) {
			failure(e.message);
		})
		req.end()
	}
	,
	full_search : function ( title, success, failure) {
		//console.log("call to tmdb :  http://api.themoviedb.org/3/search/" + type + "?api_key=" + config.tmdb_key + "&query=" +encodeURIComponent (title) + "&year=" + year)
		var req = http.request({
			hostname : "api.themoviedb.org",
			port : 80,
			path : "/3/search/multi?api_key=" + config.tmdb_key + "&query=" +encodeURIComponent( title) ,
			method : "GET"
		}, function (res) {
			var st = '';
			res.on('data', function (chunk) {
				st += chunk;
			})
			res.on('end', function () {
				var res = JSON.parse(st)

				success(res)

			})
		});
		req.on("error", function (e) {
			failure(e.message);
		})
		req.end()
	}
}

//client side code
function tmdb(main, append, success) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'json';
	xhr.onload = function () {
		if (xhr.status == 200) {
			success(xhr.response);
		} else {
			alert("an error occured " + xhr.status + "   content :" + xhr.response)
		}
	}
	xhr.open("GET", "tmdb");
	shr.send();
}
