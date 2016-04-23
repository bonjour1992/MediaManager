var express = require('express')
	var cookieParser = require('cookie-parser')
	var bodyParser = require('body-parser')
	var db = require('./db/mysql.js')
	var crypto = require('sha1')
	var uuid = require('node-uuid');
var tmdb = require('./tmdb.js')
	var mb = require('./musicbrainz.js')
	var util = require('./utils.js')
	var config = require('./config.js')
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

							res.json(val)
						},st_err(res,"DB"))
				}, st_err(res,"MB"))

			} else if (req.body.type === "album") {
					mb.query("release",req.body.id,"artists+recordings", function (info) {
					res.json(util.proper_property(info, "album"))
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
				for (var i in res_mb) {
					//console.log(res_mb[i])
					//console.log(util.proper_property(res_mb[i], "band"))
					to_send.push(util.proper_property(res_mb[i], "band"))
				}
				res.json(to_send)
				},function (err){
				res.json(to_send)
				
				//st_err(res,"MB")()
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
	app.post('/list', function (req, res) {
		var param_ok = true
			for (var f in req.body.filters) {
				var ok = false
					//valid all parameter here
					var valid_filter = ["type","watchlist","named","file","actor", "director", "keyword", "order", "genre", "nation", "language", "companie", "rated", "unrated", "year", "rate"]
					if (valid_filter.indexOf(req.body.filters[f][0]) >= 0) {
						ok = true
					}
					if (["rated", "unrated", "rate","watchlist"].indexOf(req.body.filters[f][0]) >= 0) {
						if (req.body.filters[f][1] == "-1") {
							req.body.filters[f][1] = req.cookies.user
						}
					}
					param_ok &= ok
			}

			if (param_ok) {
				db.list(req.cookies.user || 0, req.body.filters, function (list) {
					res.json({
						name : "list of something .... thx",
						content : list
					})
				},st_err(res,"DB"))
			} else {
				res.status('400').json({
					err : "parameter not well formed"
				})
			}
	})

	return app;
}


function st_err(res,elem)
{
	return function (err)
	{
		res.status('500').json({
						err :elem+" : "+ err
					})
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