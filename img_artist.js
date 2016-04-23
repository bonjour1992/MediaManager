	var db = require('./db/mysql.js')
		var mb = require('./musicbrainz.js')
		var b 
	var lb = db.list(0,[["type","band"]],function (res)
	{
		b=res
		setInterval(process,500)
	})
	
	
	function process()
	{
		var f= b.splice(0, 1)[0]
		mb.query("artist",f.id,"url-rels",function (res_mb)
		{
			for (var s in res_mb["relation-list"][0].relation)
			{
			if (res_mb["relation-list"][0].relation[s]['$']["type"]=="IMDb")
			{
				//console.log(res_mb["relation-list"][0].relation[s].target[0]['_'])
			}
			if (res_mb["relation-list"][0].relation[s]['$']["type"]=="image")
			{
				console.log( "https://upload.wikimedia.org/wikipedia/commons/d/da/"+res_mb["relation-list"][0].relation[s].target[0]['_'].substring(res_mb["relation-list"][0].relation[s].target[0]['_'].lastIndexOf(":")+1))
				//db.save_poster("band",f.id, "https://upload.wikimedia.org/wikipedia/commons/d/da/"+res_mb["relation-list"][0].relation[s].target[0]['_'].substring(res_mb["relation-list"][0].relation[s].target[0]['_'].lastIndexOf(":")))
			}
			}
		})
	}