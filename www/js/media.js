function media(type,id)
{
	//structure
	_get("main")._clean()
	var main = _get("main")
	b_panel(main,"p-main","",noop)()
	var p_main=_get("body-p-main").childNodes[0]
	var name = $("#p-main a")[0]._add_elem("span",{id:"name"})
	var posters=p_main._add_elem("div",{id:"posters"})
	var info=p_main._add_elem("div",{id:"info"})
	var rating=p_main._add_elem("div",{id:"rating"})
	//req
	core.clear()
	core.init(type,id)
	core.request("get_info",{id:id,type:type},"info")
	core.request("get_rating",{id:id,type:type},"rating")
	core.request("get_file",{id:id,type:type},"file")
	
	core.listener("info.name",b_set_title())
	
	//posters
	core.listener("info.posters",b_carousel(posters,"carousel-posters",300))
	
	//info
	core.listener("info.name",b_append(name))
	core.listener("info.year",b_append(name," (",")" ))
	core.listener("info.artist",b_item(info,"artist : "))
	core.listener("info.original_name",b_append(name,"  "))
	core.listener("info.runtime",b_append_tag(info,"p","Runtime : "))
	core.listener("info.date",b_append_tag(info,"p","Date : "))
	core.listener("info.birthday",b_append_tag(info,"p","Birthday : "))
	core.listener("info.deathday",b_append_tag(info,"p","Death : "))
	core.listener("info.birthplace",b_append_tag(info,"p","Birth Place: "))
	core.listener("info.overview",b_append_tag(info,"p"))
	core.listener("info.status",b_append_tag(info,"p","Status : "))
	core.listener("info.tagline",b_append_tag(info,"p","Tagline : "))
	//list
	core.listener("info.genres",b_list_comma(info,"Genres : "))
	core.listener("info.languages",b_list_comma(info,"Languages: "))
	core.listener("info.networks",b_list_comma(info,"Networks : "))
	core.listener("info.productions",b_list_comma(info,"Production : "))
	core.listener("info.countries",b_list_comma(info,"Countries : "))
	core.listener("info.keywords",b_list_comma(info,"Keywords : "))
	
	core.listener("info.songs",b_list_comma(info,"Songs : "))	
	var p_button = info._add_elem("p")
	core.listener("info.site",b_button(p_button,"Offical Site"))
	core.listener("info.tmdb_id",b_button(p_button,"TMDB","https://www.themoviedb.org/"+type+"/"))
	core.listener("info.imdb",b_button(p_button,"IMDB","http://www.imdb.com/"+(type=="person"?"name":"title")+"/"))
	
	
	core.listener("rating",b_rating_multiline(rating))
	core.listener("info.watchlist",b_switch(rating,"Watchlist : ",function () {return function (st){watchlist(core.content,st)}}()))
	//cast
	var panel =main._add_elem("div",{class:"panel-group",id:"panel",role:"tablist"})
	core.listener("info.director",b_panel(panel,"director","Director",b_list_cover_printer()))
	core.listener("info.cast",b_panel(panel,"cast","Cast",b_list_cover_printer()))
	core.listener("info.crew",b_panel(panel,"crew","Crew",b_list_cover_printer()))
	core.listener("info.tv_creator",b_panel(panel,"tv_creator","TV Creator",b_list_cover_printer()))
	core.listener("info.tv_cast",b_panel(panel,"tv_cast","TV Cast",b_list_cover_printer()))
	core.listener("info.tv_crew",b_panel(panel,"tv_crew","TV Crew",b_list_cover_printer()))
	
	
	core.listener("info.releases",b_panel(panel,"releases","Releases",b_list_cover_printer()))	
	//file
	core.listener("file.filename",b_panel(panel,"file","file",b_append_tag({},"p")))
	core.listener("file.size",b_append_tag("panel-body-file","p","size : "," Mo"))
	core.listener("file.path",b_cond(video_check,b_command("panel-body-file","watch",b_player_video,"data")))
	core.listener("file.path",b_cond(audio_check,b_command("panel-body-file","listen",b_player_audio,"data")))
	core.listener("file.path",b_button("panel-body-file","download","data"))
	core.listener("file.available",b_panel(panel,"file","file",b_append_tag({},"p","Files availables : ")))
	core.listener("file.available",b_command("panel-body-file","Listen",function () { return function() {core.request("playlist",{id:id,type:type},"playlist")}}))
	core.listener("file.available",b_button("panel-body-file","Download","../api/zip_playlist?id="+id+"&type="+type))
	core.listener("playlist",b_playlist_audio())
}