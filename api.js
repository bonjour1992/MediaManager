	var express = require('express')
	var cookieParser = require('cookie-parser')
	var bodyParser = require('body-parser')
	var db = require('./db/mysql.js')
	var crypto = require('sha1')
	var md5 = require('MD5')
	var uuid = require('node-uuid');
	var tmdb = require('./tmdb.js')
	var zip = require('./zip.js')
	var mb = require('./musicbrainz.js')
	var wiki = require('./wikipedia.js')
	var util = require('./utils.js')
	var config = require('./config.js')
	var lyric = require('./lyric.js')
	var kickass = require('./kickass.js')
var torrent = require('./torrent.js')


	module.exports = function () {
		var app = express()
		app.use(cookieParser())
		app.use(bodyParser.json())
		app.use(function (req, res, next) {
			res.type('json')

			next()
		})

		this.tokens = {};

		var build_token = function () {
			var token = uuid.v4()
			tokens[token] = Date.now() + 30 * 24 * 60 * 60 * 1000 //magic number everywhere
			return token
		}

		var check_auth = function (req, res) {
			if (req.cookies.token && req.cookies.user) {
				if (this.tokens[req.cookies.token] > Date.now()) {
					return true
				}
			}

			res.status('403').json({
				err : 'you need to be logged to perform this'
			})
			return false

		}
	//TODO search and destroy delete old token

	var check_param = function (req, res, params) {
		for (var p in params) {
			if (typeof req.body[params[p]] === "undefined") {
				res.status('422').json({
					err : 'necessary parameter missing' + params[p]
				})
				return false
			}
		}
		return true
	}

	app.post('/login', function (req, res) {
		if (check_param(req, res, ['username', 'password'])) {
			db.login(req.body.username, crypto(req.body.password), function (id) {
				res.cookie("user", id)
				res.cookie("token", build_token(), {
					maxAge : 30 * 24 * 60 * 60 * 1000
				})
				res.cookie("username", req.body.username)
				res.json({
					id : id
				})
			}, function () {
				res.status('401').json({
					err : 'password or username incorect'
				})
			})
		}
	})

	app.post('/get_info', function (req, res) {
		if (check_param(req, res, ['id', 'type'])) {
			if (req.body.type === "band") {
				mb.query("artist",req.body.id,"releases", function (info) {
					db.list(req.cookies.user,[["artist",req.body.id],["type","album"]],
						function (albums)
						{
							var val = util.proper_property(info, "band")
							for ( var r in val.releases)
							{
								for ( var a in albums)
								{
									if (val.releases[r].id== albums[a].id)
									{
										val.releases[r].poster=albums[a].poster
										val.releases[r].file=true
										val.releases[r].rate=albums[a].rate
									}
								}
							}
							wiki.query("extracts&exintro=&explaintext=",val.name||"",function (ext) {
								val.overview = ext.extract
								wiki.query("images", val.name , function (imgs)
								{
									val.posters=[]
									for ( var i in imgs.images)
									{
										var img = imgs.images[i].title.replace(/ /g,"_")
										if ( img.substring(img.lastIndexOf("."))!=".svg" && img.substring(img.lastIndexOf("."))!=".ogg"&& img.substring(img.lastIndexOf("."))!=".php")
										{

											var h = md5(img.substring(img.lastIndexOf(":")+1))
											val.posters.push("https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+img.substring(img.lastIndexOf(":")+1))
										}
									}
									res.json(val)	
								},st_err(res,"Wikipedia"))


							},st_err(res,"Wikipedia"))
							
						},st_err(res,"DB"))
				}, st_err(res,"MB"))

			} else if (req.body.type === "album") {
				mb.query("release",req.body.id,"artists+recordings", function (info) {
					var val =util.proper_property(info, "album")

					wiki.query("extracts&exintro=&explaintext=",val.name||"",function (ext) {
								val.overview = ext.extract
								wiki.query("images", val.name , function (imgs)
								{
									val.posters=[]
									for ( var i in imgs.images)
									{
										var img = imgs.images[i].title.replace(/ /g,"_")
										if ( img.substring(img.lastIndexOf("."))!=".svg" && img.substring(img.lastIndexOf("."))!=".ogg"&& img.substring(img.lastIndexOf("."))!=".php")
										{

											var h = md5(img.substring(img.lastIndexOf(":")+1))
											val.posters.push("https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+img.substring(img.lastIndexOf(":")+1))
										}
									}
									res.json(val)	
								},st_err(res,"Wikipedia"))


							},st_err(res,"Wikipedia"))
				}, st_err(res,"MB"))
			}
			else if (req.body.type === "song") 
			{
				mb.query("recording",req.body.id,"artists+releases", function (info) {
					res.json(util.proper_property(info, "song"))
				}, st_err(res,"MB"))
			}
			
				else //tmdb is default
				{
					tmdb.query(req.body.type + "/" + req.body.id, config.append[req.body.type], function (info) {
						var val = util.proper_property(info, req.body.type)
						val.cast = val.cast || []
						val.crew = val.crew || []
						db.get_list_rating(val.cast.concat(val.crew).concat(val.director), req.cookies.user || 0, function (l_id) {
							for (var i in val.cast) {
								if (l_id[val.cast[i].id]) {
									val.cast[i].rate = l_id[val.cast[i].id].rate
									val.cast[i].file = l_id[val.cast[i].id].file
								}
							}
							for (var i in val.crew) {
								if (l_id[val.crew[i].id]) {
									val.crew[i].rate = l_id[val.crew[i].id].rate
									val.crew[i].file = l_id[val.crew[i].id].file
								}
							}
							for (var i in val.director) {
								if (l_id[val.director[i].id]) {
									val.director[i].rate = l_id[val.director[i].id].rate
									val.director[i].file = l_id[val.director[i].id].file
								}
							}
							db.get_watchlist(req.body.type,req.body.id,req.cookies.user ,function (watchlist)
							{
								if (req.body.type=="movie")
								{
									val.watchlist=watchlist[0].yes?"yes":"no"
								}
								res.json(val)
							})

						})

					},st_err(res,"TMDB"))
				}
			}

		})

	app.post('/get_rating', function (req, res) {
		if (check_param(req, res, ['id', 'type'])) {
			db.get_rating(req.body.type, req.body.id, function (rating) {
				var rated = false || !req.cookies.user
				for (var i in rating) {

					if (rating[i].id == req.cookies.user) {
						rated = true
					}
				}
				if ((req.body.type == "movie" || req.body.type == "album"  || req.body.type == "band"  || req.body.type == "song") && !rated) {
					rating.push({
						id : req.cookies.user,
						name : req.cookies.username,
						info : 0,
						type : 'user'
					})
				}
				res.json(rating)
			},st_err(res,"DB"))
		}
	})

	app.post('/table', function (req, res) {
		if (check_param(req, res, ['req'])) {
			if (req.body.user == -1) {
				req.body.user = req.cookies.user
			}
			db.get_table(req.body, req.cookies.user, st_json(res),st_err(res,"DB"))
		}
	})

	app.post('/rate', function (req, res) {
		if (check_auth(req, res) && check_param(req, res, ['id', 'type', 'value'])) {
			db.rate(req.cookies.user, req.body.type, req.body.id, req.body.value, st_ok(res),st_err(res,"DB"))
		}
	})

	app.post('/unrate', function (req, res) {
		if (check_auth(req, res) && check_param(req, res, ['id', 'type'])) {
			db.rate(req.cookies.user, req.body.type, req.body.id, function () {
				res.json("OK")
			},st_err(res,"DB"))
		}
	})
	app.post('/get_file', function (req, res) {
		if (check_auth(req, res) && check_param(req, res, ['id', 'type'])) {
			if (req.body.type=="album" || req.body.type=="band" )
			{
				db.has_file(req.body.type, req.body.id, st_json(res),st_err(res,"DB"))
			}
			else{
				db.get_file(req.body.type, req.body.id, function (result) {
					if (result) {
						res.json(result)
					} else {
						res.status('404').json({
							err : " no file found for this media"
						})
					}
				},st_err(res,"DB"))
			}
		}
	})

	app.post('/search', function (req, res) {
		if (check_param(req, res, ['text'])) {
			tmdb.full_search(req.body.text, function (result) {
				var to_send = []
				for (var i in result.results) {
					to_send.push(util.proper_property(result.results[i], result.results[i].media_type))
				}
				mb.search("artist",req.body.text, function (res_mb)
				{
					for (var i in res_mb.artists) {
						if ( i <10)
						{

							to_send.push(util.proper_property(res_mb.artists[i], "band"))
						}
					}
					mb.search("release",req.body.text, function (res_mb)
					{
						for (var i in res_mb.releases) {
							if ( i <10)
							{

								to_send.push(util.proper_property(res_mb.releases[i], "album"))
							}
						}



						mb.search("recording",req.body.text, function (res_mb)
						{
							for (var i in res_mb.recordings) {
								if ( i <20)
								{

									to_send.push(util.proper_property(res_mb.recordings[i], "song"))
								}
							}

							res.json(to_send)
							
						},function (err){
							res.json(to_send)
						})},function (err){
							res.json(to_send)
						})
				},function (err){
					res.json(to_send)
				})

			},st_err(res,"TMDB"))
		}
	})
	app.post('/watchlist',function (req,res){
		if (check_auth(req, res) && check_param(req,res,['state','type','id']))
		{
			if (req.body.state)
			{
				db.add_watchlist(req.body.type,req.body.id,req.cookies.user,st_ok(res),st_err(res,"DB"))
			}
			else
			{
				db.del_watchlist(req.body.type,req.body.id,req.cookies.user,st_ok(res),st_err(res,"DB"))
			}
		}
	})
	app.post('/playlist',function(req,res)
	{
		if (check_param(req,res,['type','id']))
		{
			db.playlist(req.body.type,req.body.id,st_json(res),st_err(res,"DB"))
		}
	})
		app.post('/save_playlist',function(req,res)
	{
		if (check_param(req,res,['name','list']))
		{
			db.save_playlist(req.body.name,req.body.list,st_ok(res),st_err(res,"DB"))
		}
	})
	app.get('/zip_playlist',function(req,res)
	{

			db.playlist(req.query.type,req.query.id,function (pl)
			{
				zip.zip(pl,"song",res)

			}
				,st_err(res,"DB"))

	})
	app.post('/list', function (req, res) {
		var param_ok = true
		var named,genre
		for (var f in req.body.filters) {
			var ok = false
					//valid all parameter here
					var valid_filter = ["wanted","type","watchlist","named","file","actor", "director", "keyword", "order", "genre", "nation", "language", "companie", "rated", "unrated", "year", "rate","like","id_like"]
					if (valid_filter.indexOf(req.body.filters[f][0]) >= 0) {
						ok = true
					}
					if (["rated", "unrated", "rate","watchlist"].indexOf(req.body.filters[f][0]) >= 0) {
						if (req.body.filters[f][1] == "-1") {
							req.body.filters[f][1] = req.cookies.user
						}
					}
					if (req.body.filters[f][0]=="named")
					{
						named=req.body.filters[f][1]
					}
					if (req.body.filters[f][0]=="genre")
					{
						genre=req.body.filters[f][1]
					}
					param_ok &= ok
				}

				if (param_ok) {
					db.list(req.cookies.user || 0, req.body.filters, function (list) {
						res.json({
							name : "list of something .... thx",
							content : list,
							playable:genre?{playable :  (list.length>0 && list[0].type=="song"),
							id:genre,type:"genre"}:named?{playable :  (list.length>0 && list[0].type=="song"),
							id:named,type:"named"}:false
						})
					},st_err(res,"DB"))
				} else {
					res.status('400').json({
						err : "parameter not well formed"
					})
				}
			})
		app.post('/lyric',function (req,res)
		{
			if (check_param(req,res,['file']))
		{
			lyric.lyric(req.body.file,st_json(res))
		}
		})
		app.post('/torrent_search',function (req,res)
		{
			if (check_param(req,res,['name','id','type']))
			{
				switch (req.body.type)
				{
					case "band":
					kickass.search("category:music "+req.body.name,req.body.id,req.body.type,st_json(res),st_err(res,"kickass"))
					break
					case "tv":
					kickass.search("category:tv "+req.body.name,req.body.id,req.body.type,st_json(res),st_err(res,"kickass"))
					break
					case "movie":
					kickass.search("category:movies "+req.body.name,req.body.id,req.body.type,st_json(res),st_err(res,"kickass"))
					break
				}

			}
		})
		app.post('/download',function (req,res)
		{
			if (check_param(req,res,['magnet','id','type','hash']))
			{
				torrent.addTorrent(req.body.magnet,req.body.type)
				db.torrent(req.body.type,req.body.id,req.body.hash)
				st_ok(res)()
			}
		})
	return app;
}


function st_err(res,elem)
{
	return function (err)
	{
		if (err.indexOf("busy")!=-1)
		{
		res.status('503').json({
			err :elem+" : "+ err
		})
		}
		else
		{
		res.status('500').json({
			err :elem+" : "+ err
		})			
		}

	}
}

function st_json(res)
{
	return function (result)
	{
		res.json(result)
	}
}

function st_ok(res)
{
	return function ()
	{
		res.json("OK")
	}
}