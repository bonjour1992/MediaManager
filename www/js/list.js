var arg_number={
	keyword:2,
	type:2,
	genre:2,
	order:3,
	language :2,
	nation :2,
	companie :2,
	rated : 2,
	unrated : 2,
	year : 2,
	rate:3,
	director:2,
	actor:2,
	file:1,
	named:2,
	watchlist:2,
	like:2,
	id_like:2,
	wanted:1
}


function list()
{
	//decode argument
	var filters =[]
	
	var cur=0

	while (cur<arguments.length)
	{
		var i = arg_number[arguments[cur]]

		var new_filter=[]
		for (var j =cur ;j<cur+i;j++)
		{
			new_filter[new_filter.length]=arguments[j]
		}

		filters[filters.length]=new_filter
		cur=cur+i
	}
	
	//structure
	_get("main")._clean()
	var main = _get("main")
	b_panel(main,"p-head","List",noop)()
	
	var head = _get("body-p-head").childNodes[0]
	
	//request
	core.clear()
	core.request("list",{filters:filters},"list")
	
	
	core.listener("list.content",b_panel(main,"Result","Result",b_list_cover_printer()))
	core.listener("list.content.length",b_append(head._add_elem("p"),"number of element : "))
	core.listener("list.name",b_append(head))
	core.listener("list.name",b_set_title())
	core.listener("list.playable",b_cond(function(data){return data.playable}, b_command(head,"Listen",function (f) { return function() {core.request("playlist",{id:f.id,type:f.type},"playlist")}})))
	core.listener("list.playable",b_cond(function(data){return data.playable}, b_button(head,"Download",function (f) {return "./api/zip_playlist?id="+f.id+"&type="+f.type })))
	//core.listener("list.named",b_button(head,"Download","../api/zip_playlist?id="+id+"&type=named"))
	//core.listener("list.add",b_panel(main,"Add","Add",function () {}))
	core.listener("playlist",b_playlist_audio())
}