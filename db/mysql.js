var mysql = require('mysql');
var config = require('../config.js');
var pool = mysql.createPool({
	host : 'localhost',
	user : config.db_user,
	password : config.db_password,
	database : config.db_base,

	connectionLimit : 50,
	queueLimit : 5000,
	charset : "utf8_general_ci"});



function exec_query(query, success, cb_err, proccessing) {
	success = success || noop
	cb_err = cb_err || noop
	pool.getConnection(function (err, conn) {
		if (err) {
			console.log(err)
			cb_err()
		}
		conn.query(query, function (err, rows) {
			if (err) {
				console.log(err)
				cb_err()
			} else {
				if (proccessing) {
					rows = proccessing(rows)
				}
				success(rows)
			}
			conn.release()
		})
	})
}
module.exports = {

	login : function (username, password, success, incorect, cb_err) {

		exec_query("select id from user where username='" + username + "' and password='" + password + "'", function (res) {
			if (res) {
				success(res)
			} else {
				incorect();
			}
		}, cb_err, function (res) {
			if (res[0].id) {
				return res[0].id
			} else {
				return false
			}
		})
	},
	get_rating : function (type, id, success, cb_err) {
		exec_query("select user as id,username as name ,rate as info, 'user' as type from rating join user on id=user where media ='" + db_id(type, id) + "'", success, cb_err)

	},
	get_list_rating : function (list, user, success, cb_err) {
		if (list[0]) {

			s=list.map(function (val) {
				return "'" + val.type[0] + val.id + "'"
			}).join()
			exec_query("select id, max(rate) as rate,max( file) as file from (( select substr(media,2) as id,null as file, rate from rating  where user='" + user + "' and media in (" + s + ")) union (select substr(media,2) as id,filename as file,0 as rate from file where media in (" + s + "))) t group by id", success, cb_err, function (rows) {
				var res = {}
				for (var i in rows) {
					res[rows[i].id]={}
					res[rows[i].id].rate = rows[i].rate
					res[rows[i].id].file = rows[i].file
				}
				return res
			})
		} else {
			success([])
		}
	},
	list : function (user, filters, success, cb_err) {
		var start = "select substr(id,2) as id,name,date,poster,substr(id,1,1) as type,rate as rate,file.media as file from media left join ( select media,rate,date as date_rate from rating where user=" + (user || 0) + ") rating on id=rating.media left join file on id=file.media"
			//where
			var where = " where '1'='1'"
			var order = ""
			for (var f in filters) {
				switch (filters[f][0])
				{
					case "type":
					where+=" and id like '"+db_id(filters[f][1],"")+"%' "
					break
					case "rated":
					where += " and id in ( select media from rating where user='" + filters[f][1] + "') "
					break
					case "unrated":
					where += " and id not in ( select media from rating where user='" + filters[f][1] + "') "
					break
					case "rate":
					where += " and id  in ( select media from rating where user='" + filters[f][1] + "' and rate='" + filters[f][2] + "') "
					break
					case "director":
					where += "and id in (select object from link where type='director' and properties='p" + filters[f][1] + "') "
					break
					case "actor":
					where += "and id in (select object from link where type='cast' and properties='p" + filters[f][1] + "') "
					break
					case "order":
					order = "order by " + filters[f][1] + (filters[f][2] == "desc" ? " DESC" : "")
					break
					case "year":
					where += "and id in (select id from media where year(date)='" + filters[f][1] + "') "
					case"file":
					where += "and id in (select media from file where id like 'm%' ) "
					break
					case "artist":
					where += "and id in (select object from link where type='artist' and properties='b" + filters[f][1] + "') "
					break
					case "album":
					where += "and id in (select object from link where type='album' and properties='a" + filters[f][1] + "') "
					break
					case "named":
					where += "and id in (select object from link where type like 'list%'  and properties='z"+filters[f][1]+"') "
					break
					case "watchlist":
					where += "and id in (select object from link where type='watchlist' and properties='u"+filters[f][1]+"') "
					break
					case "like":
					where +=" and name like '"+filters[f][1]+"%' "
					break
					case "id_like":
					where +=" and id like '"+filters[f][1]+"%' "
					break				
					default: 
					where += " and id in (select object from link where properties='" + filters[f][0][0] + filters[f][1] + "') "
				}

			}
			var query = start + where + order
			exec_query(query, function (res) {
				for (var e in res)	
				{
					res[e].type = t_type()[res[e].type]
				}
				success(res)
			}, cb_err)
		},
		rate : function (user, type, id, value, success, cb_err) {
			exec_query("insert into rating values('" + user + "','" + db_id(type, id) + "','" + value + "',now()) on duplicate key update rate='" + value + "'", success, cb_err)
		},
		unrate : function (user, type, id, value, success, cb_err) {
			exec_query("delete from  rating where user='" + user + "' and media='" + db_id(type, id) + "'", success, cb_err)
		},
		get_file : function (type, id, success, cb_err) {
			exec_query("select * from file where media='" + db_id(type, id) + "'", success, cb_err, function (res) {
				if (!res[0]) {
					return false
				} else {
					return {
						filename : res[0].filename,
						path : res[0].folder + res[0].filename,
						size : parseInt(res[0].size / 1024 / 1024)
					}
				}
			})
		},
		has_file : function (type,id,cb,cb_err)
		{
			exec_query("select count(*) as available from file join link on media=object where properties='"+db_id(type,id)+"' ",cb,cb_err,function (r) {return r[0]})
		},
		get_files_list : function (success, cb_err) {
			exec_query("select concat(filename,'#',size) as file_concat from file", success, cb_err, function (rows) {
				var res = []
				for (var i in rows) {
					res.push(rows[i].file_concat)
				}
				return res
			})

		},
		add_watchlist: function (type,id,user,success,cb_err)
		{
			exec_query("insert into link values('" + db_id(type, id) + "','" + db_id("user",user) + "','watchlist','')")
		},
		del_watchlist:function(type,id,user,cb)
		{
			exec_query("delete from link where object ='" + db_id(type, id) + "' and  properties='" + db_id("user",user) + "' and type='watchlist' ")
		},
		get_table : function (arg, user, success, cb_err) {

			var query
			if (arg.req == "pref") {
				query = "select '" + arg.type_full + "' as 'elem.type', substring(tot.id,2) as 'elem.id', name as 'elem.name' ,nb_seen ,nb_tot,( (nb_seen/nb_tot)/((select count(media ) from rating where user='" + arg.user + "' and media like 'm%' )/(select count(id) from media where id like 'm%'))) as f_seen ,rate,(rate-(select avg(rate) from rating where user='" + arg.user + "' and media like'm%')) as delta_rate from (select id,name,count(object) as nb_seen,avg(rate) as rate from link join media on properties=id join rating on media=object where type='" + arg.link + "' and properties like '" + arg.type + "%' and user='" + arg.user + "'group by properties having count(object)>=" + arg.limit + " ) as  seen  join (select id,count(object) as nb_tot from link join media on properties=id  where type='" + arg.link + "' and properties like '" + arg.type + "%' group by properties  ) as tot on tot.id=seen.id order by nb_seen desc"
			} else if (arg.req == "movie") {
				query = "select * from media"
			}

			exec_query(query, success, cb_err, function (rows) {
				for (var i in rows) {
					for (var j in rows[i]) {
						if (j.indexOf(".") >= 0) {
							if (!rows[i][j.substring(0, j.indexOf("."))]) {
								rows[i][j.substring(0, j.indexOf("."))] = {}
							}
							rows[i][j.substring(0, j.indexOf("."))][j.substring(j.indexOf(".") + 1)] = rows[i][j]
							delete rows[i][j]
						}
					}
				}

				return rows
			})
		},
		save : function (type, info, success, cb_err) {
		//TODO if already in base do .....

		//media
		if (info.id) {
			exec_query("insert into media values('" + db_id(type, info.id) + "','" + mysql_real_escape_string(info.title || info.name || info.id) + "','" + (info.release_date || info.first_air_date || info.birth_date || (info.year+"-01-01")||"") + "','" + (info.poster_path || info.profile_path ||mysql_real_escape_string("data"+info.folder+"Folder.jpg")|| "") + "')")
			//credits
			if (info.credits) {
				for (var i in info.credits.cast) {
					exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("person", info.credits.cast[i].id) + "','cast','" + mysql_real_escape_string(info.credits.cast[i].character || "") + "')")
				}
				for (var i in info.credits.crew) {
					if (info.credits.crew[i].job == "Director") {
						exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("person", info.credits.crew[i].id) + "','director','')")
					}
					exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("person", info.credits.crew[i].id) + "','crew','" + info.credits.crew[i].job + "')")
				}

			}
			//keywords
			if (info.keywords) {
				for (var i in info.keywords.keywords) {
					exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("keyword", info.keywords.keywords[i].id) + "','keyword','')")
				}
			}
			// genre
			if (info.genres) {
				for (var i in info.genres) {
					exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("genre", info.genres[i].id) + "','genre','')")
				}
			}
			//language
			if (info.original_language) {
				exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("l", info.original_language) + "','language','primary')")
			}
			if (info.spoken_languages) {
				for (var i in info.spoken_languages) {
					if (info.spoken_languages[i].iso_639_1 !== info.original_language)
						exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("l", info.spoken_languages[i].iso_639_1) + "','language','')")
				}
			}
			// compagny
			if (info.production_companies) {
				for (var i in info.production_companies) {
					exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("c", info.production_companies[i].id) + "','companie','')")
				}
			}
			//countries
			if (info.production_countries) {
				for (var i in info.production_countries) {
					exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("n", info.production_countries[i].iso_3166_1) + "','nation','')")
				}
			}
			if (info.vote_average) {
				exec_query("insert into rating values('0','" + db_id(type, info.id) + "','" + info.vote_average + "','') on duplicate key update rate='" + info.vote_average + "'")
			}

			info.album_id = info.album_id||"-"+info.album
			info.artist_id = info.artist_id ||"-"+info.artist

			if (info.album_id ){
				exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("album",info.album_id) + "','album','"+ (1*info.disc*1000+1*info.track)+"')")
				exec_query(" insert into media values('"+db_id('album',info.album_id)+"','"+ mysql_real_escape_string(info.album)+"','"+info.year+"-01-01','data"+info.folder+"Folder.jpg')")
				exec_query("insert into link values('" + db_id('album',info.album_id) + "','" + db_id("band",info.artist_id) + "','artist','')")
			}

			if (info.artist_id ){
				exec_query("insert into link values('" + db_id(type, info.id) + "','" + db_id("band",info.artist_id) + "','artist','"+info.album_id+"-"+ (1*info.disc*1000+1*info.track)+"')")
				exec_query("insert into media values('"+db_id('band',info.artist_id)+"','"+ mysql_real_escape_string(info.artist)+"','','')")
			}
			if (info.genre_id)
			{
				exec_query("insert into link values('" + db_id(type, info.id) + "','gm"+info.genre_id + "','genre-music','')")
				exec_query("insert into media values('gm"+info.genre_id+"','"+ info.genre+"','','')")
			}

		}

		if (success) {
			success()
		}
	},
	save_file : function (type, id, file,cb, err) {
		exec_query(" insert into file values('" + db_id(type, id) + "','" + mysql_real_escape_string(file.file) + "','" + mysql_real_escape_string(file.folder) + "','" + file.size + "')",cb,err)
	},
	get_list_properties : function (cb, err) {
		exec_query("select distinct(properties) as prop from link where  properties not in (select id from media)", cb, err)
	},
	get_list_missing : function (type, cb, err) {
		exec_query("select  '" + type + "' as type , substring(media,2) as id  from ((select media from rating) union (select media from file) union (select object from link where type ='watchlist')) med where media not in (select id from media) and media like '" + type[0] + "%'", cb, err)
	},
	get_watchlist:function(type,id,user,cb)
	{
		exec_query("select count(*) as yes from link where type='watchlist' and object='"+db_id(type,id)+"' and properties='u"+user+"'",cb )
	},
	log : function (elem, log) {
		exec_query("insert into log values('" + elem + "','" + log + "','')")
		console.log(elem + "   :   " + log)
	},
	playlist : function (type,id ,cb, err)
	{
		exec_query("select distinct 'song' as type , substring(object,2) as id ,name,artist, concat('/data',folder,filename) as filename from link join file on object=media join media on object= id  join  (select distinct name as artist,object as s  from media join link on id=properties where type='artist' ) ta on s=id  where  (( type='artist' or type='album' or type='list-song' or type='genre-music' ) and properties='"+db_id(type,id)+"') or (object='"+db_id("song",id)+"') order by properties,value",cb,err)
	},
	play_rated : function (user,rate,cb,err)
	{
		exec_query("select  'song' as type , substring(id,2) as id ,name, filename, folder from rating natural join file  join media on media= id where rate>='"+rate+"' order by rand()",cb,err)
	},
	upd_media : function(type,id,date,img,cb,err)
	{
		if (img)
		{
			exec_query("update media set poster='"+mysql_real_escape_string(img)+"'  where id='"+db_id(type,id)+"'")
		}
		if (date)
		{
			exec_query("update media set date='"+date+"'  where id='"+db_id(type,id)+"'")
		}		
	},
	save_playlist:function(name,list,cb,err)
	{
		exec_query("insert into media values ('z-music-"+name+"','"+name+"','','') ")
		exec_query("delete from link where type='list-song' and properties='z-music-"+name+"'", function (){
			for (var i in list)
			{
				exec_query("insert into link values ('"+db_id("song",list[i].id)+"','z-music-"+name+"','list-song','"+i+"') ")
			} })
		if (cb)
		{
			cb()
		}
	},
	torrent:function (type,id,hash)
	{
		exec_query("insert into link values('"+db_id(type,id)+"','t"+hash+"','torrent','"+type+"')")
	}

}

function db_id(type, id) {

	var pre 
	switch ( type)
	{
		case "named":
		pre="z"
		break
		default :
		pre= type[0]
	}

	return pre + id
}

function t_type()
{
	return {a:"album",m:"movie",b:"band",s:"song",z:"named",g:"genre"}
}

function noop() {}

function mysql_real_escape_string(str) {
	return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
		switch (char) {
			case "\0":
			return "\\0";
			case "\x08":
			return "\\b";
			case "\x09":
			return "\\t";
			case "\x1a":
			return "\\z";
			case "\n":
			return "\\n";
			case "\r":
			return "\\r";
			case "\"":
			case "'":
			case "\\":
			return "\\" + char; // prepends a backslash to backslash, percent,
			// and double/single quotes
		}
	});
}
