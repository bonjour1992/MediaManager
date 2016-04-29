	var db = require('./db/mysql.js')
		var mb = require('./musicbrainz.js')
				var wiki = require('./wikipedia.js')
		var crypto = require('MD5')
		var b 
	var lb = db.list(0,[["type","band"]],function (res)
	{
		b=res
		setInterval(process,2500)
	})
	
	
	function process()
	{
		var f= b.splice(0, 1)[0]
		var date
		var poster
		var name
		mb.query("artist",f.id,"url-rels",function (res_mb)
		{
			name=res_mb.name[0]
			if (res_mb["life-span"] && res_mb["life-span"][0]["begin"])
				{
				date=res_mb["life-span"][0]["begin"][0]
				if (date.length==4)
				{
					date+="-01-01"
				}
				else 				if (date.length==7)
				{
					date+="-01"
				}
				}
				if (res_mb["relation-list"])
				{
			for (var s in res_mb["relation-list"][0].relation)
			{
			if (res_mb["relation-list"][0].relation[s]['$']["type"]=="IMDb")
			{
				//console.log(res_mb["relation-list"][0].relation[s].target[0]['_'])
			}
			if (res_mb["relation-list"][0].relation[s]['$']["type"]=="image")
			{
				var h = crypto(res_mb["relation-list"][0].relation[s].target[0]['_'].substring(res_mb["relation-list"][0].relation[s].target[0]['_'].lastIndexOf(":")+1))
				//console.log( "https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+res_mb["relation-list"][0].relation[s].target[0]['_'].substring(res_mb["relation-list"][0].relation[s].target[0]['_'].lastIndexOf(":")+1))
				 poster ="https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+res_mb["relation-list"][0].relation[s].target[0]['_'].substring(res_mb["relation-list"][0].relation[s].target[0]['_'].lastIndexOf(":")+1)
			}
			
			}
				}
				
			if (!poster)
			{
				wiki.query("images",name.replace(/ /g,"_"),function (res) {
					
					for ( var i in res.images)
					{
						var img = res.images[i].title.replace(/ /g,"_")
						if (!poster && img.substring(img.lastIndexOf("."))!=".svg" && img.substring(img.lastIndexOf("."))!=".ogg"&& img.substring(img.lastIndexOf("."))!=".php")
						{
							console.log(img)
						var h = crypto(img.substring(img.lastIndexOf(":")+1))
						 poster ="https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+img.substring(img.lastIndexOf(":")+1)
					}
					}
					db.upd_media("band",f.id,date,poster)
				},function () {})
			}
			else{
			db.upd_media("band",f.id,date,poster)
			}
		},function (err) {console.log(err)})
	}