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
			name=res_mb.name
			if (res_mb["life-span"] && res_mb["life-span"]["begin"])
				{
				date=res_mb["life-span"]["begin"]
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
			for (var s in res_mb["relations"])
			{
			if (res_mb["relations"][s]["type"]=="IMDb")
			{
				//console.log(res_mb["relation-list"][0].relation[s].target[0]['_'])
			}
			if (res_mb["relations"][s]["type"]=="image")
			{
				var h = crypto(res_mb["relations"][s].url.resource.substring(res_mbres_mb["relations"][s].url.resource.lastIndexOf(":")+1))
				//console.log( "https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+res_mb["relation-list"][0].relation[s].target[0]['_'].substring(res_mb["relation-list"][0].relation[s].target[0]['_'].lastIndexOf(":")+1))
				 poster ="https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[0]+h[1]+"/"+res_mbres_mb["relations"][s].url.resource.substring(res_mbres_mb["relations"][s].url.resource.lastIndexOf(":")+1)
			}
			
			}
				}
				
			if (!poster)
			{
				wiki.query("images",name.replace(/ /g,"_"),function (res) {
					
					for ( var i in res.images)
					{
						var img = res.images[i].title.replace(/ /g,"_")
						if (!poster && img.substring(img.lastIndexOf("."))!=".svg" && img.substring(img.lastIndexOf("."))!=".ogg"&& img.substring(img.lastIndexOf("."))!=".php"&& img.substring(img.lastIndexOf("."))!=".gif")
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