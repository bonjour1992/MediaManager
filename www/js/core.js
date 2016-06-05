function build_core() {

	var that = this
	this.content = {}
	this.info = {}
	this.req = []
	this.list = []

	this.clear = function () {
		that.info = {}
		for (var r in that.req) {
			that.req[r].abort()
		}
		that.list = []
	}

	this.init = function (type, id, name) {
		if (type) {
			that.content.type = type
		}
		if (id) {
			that.content.id = id
		}
		if (name) {
			that.content.name = name
			document.title = name
		}
	}

	this.request = function (query, data, bloc) {
		that.req[that.req.length] = api(query, data, {
			200 : function (res) {
				that.info[bloc] = res
				that.check_all_listener()
			},
			503: retry
		})
	}

	this.check_all_listener = function () {
		for (var l in that.list) {
			that.check_listener(that.list[l])
		}
	}

	this.check_listener = function (l) {
		var obj = that.info
		var arr = l.data.split(".")
		while (arr.length && (obj = obj[arr.shift()])) {}
			if (obj && obj.length != 0) {
				l.callback(obj)
				l.data = "already done"
			}
		}

		this.listener = function (data, callback) {
			that.list[that.list.length] = {
				data : data,
				callback : callback
			}
			that.check_listener(that.list[that.list.length - 1])
		}

	}

	var core = new build_core()
	//builder of function
	function b_append(elem, prefix, sufix) {
		prefix = prefix || ""
		sufix = sufix || ""
		return function (data, prev) {
			if (typeof elem === "string") {
				elem = _get(elem)
			}
			elem = prev || elem
			elem._write(prefix + data + sufix)
		}
	}

	function b_append_tag(elem, tag, prefix, sufix, attr) {
		prefix = prefix || ""
		sufix = sufix || ""
		return function (data, prev) {
			if (typeof elem === "string") {
				elem = _get(elem)
			}
			elem = prev || elem
			elem._add_elem(tag, attr)._write(prefix + data + sufix)
		}
	}

	function b_write(elem, text) {
		return function (data, prev) {
			elem = prev || elem
			elem._write(text)
		}
	}
	function b_cover_printer(elem, com) {
		return function (data) {
			print_cover(elem, data, com)
		}
	}

	function b_panel(elem, id, title, next) {
		return function (data) {
			var p = elem._add_elem("div", {
				class : "panel panel-default"
			})
			p._add_elem("div", {
				class : "panel-heading",
				id : id,
				role : "tab"
			})
			._add_elem("h4", {
				class : "panel-title",
			})
			._add_elem("a", {
				role : "button",
				onclick : "$('#body-" + id + "').collapse('toggle')"
			})
			._write(title)
			var r = p._add_elem("div", {
				class : "panel-collapse collapse in",
				role : "tabpanel",
				id : "body-" + id
			})
			._add_elem("div", {
				class : "panel-body",
				id : "panel-body-" + id
			})
			if (next)
			{
				next(data, r)
			}
		}
	}

	function b_list_cover_printer(elem) {
		return function (data, prev) {
			print_cover_partial(data, prev || elem, 0)
		}
	}

	function print_cover_partial(data, elem, start) {
		end = start + 100 > data.length ? data.length : start + 100
		for (var k = start; k < end; k++) {
			print_cover(elem, data[k])
		}
		if (data.length > end) {
			setTimeout(function () {
				print_cover_partial(data, elem, end)
			}, 1000)
		}
	}

	function b_set_title() {
		return function (data) {
		//that.content.name= data
		document.title = data
	}
}

function print_cover(elem, media) {
	var c = elem._add_elem("div", {
		class : "cover"
	})
	if (media.poster) {
		c._add_elem("div", {
			class : "cover-container"
		})._add_elem("img", {
			src : img_tmdb(media.poster, 185),
			width :"185px"
		})
	} else {
		c._add_elem("img", {
			src : "/www/image/not-found.png"
		})
	}
	var p = c._add_elem("div", {
		class : "cover-text"+ (media.file?" available":" unavailable")
	})
	p._add_elem("a", {
		href : "#get&" + media.type + "&" + media.id
	})._add_elem("b")._write(media.name+ (media.date?" ("+media.date.substring(0,4)+")":""))
	if (media.info) {
		p._add_elem("br")
		p._write(media.info)
	}
	//if (media.rate)
	{
		p._add_elem("br")
		print_rating(p,getCookie("user")||0,media.rate,media)
	}
}

function b_button(elem, name, prefix) {
	prefix = prefix || ""
	return function (data) {
		if (typeof elem === "string") {
			elem = _get(elem)
		}
		elem._add_elem("a", {
			class : "btn btn-info",
			href : (typeof prefix=="function")?prefix(data):prefix + data,
			target : "_blank"
		})._write(name)
	}
}

function b_command(elem, name,command,prefix) {

	return function (data) {
		if (typeof elem === "string") {
			elem = _get(elem)
		}
		elem._add_elem("a", {
			class : "btn btn-info"
		})._write(name).addEventListener("click",command( prefix?prefix+data:data))
	}
}


function b_list_comma(elem, com) {
	return function (data) {
		var p = elem._add_elem("p")
		p._write(com)
		var first = true
		for (var i in data) {
			if (!first) {
				p._write(" ")
			} else {
				first = false
			}
			print_item(p, data[i])
		}
	}
}

function print_item(elem, data) {
	elem._add_elem("a", {
		href : "#get&" + data.type + "&" + data.id,
		class : "btn btn-default"
	})._write(data.name)
	elem._write(data.info ? " : " + data.info : "")
}

function print_item_link(elem, data) {
	elem._add_elem("a", {
		href : "#get&" + data.type + "&" + data.id,
		class : "lnk"
	})._write(data.name)
	elem._write(data.info ? " : " + data.info : "")
}

function b_list_multiline(elem) {
	return function (data) {
		for (var i in data) {
			print_item(elem._add_elem("p"), data[i])
		}
	}
}
function b_rating_multiline(elem) {
	return function (data) {

		for (var i in data) {
			
			var l =elem._add_elem("p")

			data[i] = data[i] || {
				type : "user",
				id : getCookie("user"),
				info : 0
			}
			l._add_elem("a", {
				href : "#get&" + data[i].type + "&" + data[i].id
			})._write(data[i].name + "  ")
			print_rating(l,data[i].id,data[i].info,core.content)
		}


	}
}


function print_rating(elem,user,rating,media)
{
	var uid=makeid()
	if (getCookie("user") && user == getCookie("user")) {
		elem._add_elem("input", {
			id : uid,
			"data-stars" : 10,
			"data-show-caption" : false,
			type : "number",
			class : "rating",
			min : 0,
			max : 10,
			step : 0.5,
			"data-size" : "xxs",
			value : rating
		})
		$("#"+uid).on('rating.change', function () {
			return function (event, value, caption) {
				rate(media, value, function () {
					$("#"+uid).parent().css('background-color', 'green')
				})
			}
		}
		())
		$("#"+uid).on('rating.clear', function () {
			return function (event, value, caption) {
				unrate(media, function () {
					$("#"+uid).parent().css('background-color', 'red')
				})
			}
		}
		())
	} else {
		elem._add_elem("input", {
			id : uid,
			"data-readonly" : true,
			"data-stars" : 10,
			"data-show-caption" : false,
			type : "number",
			class : "rating",
			min : 0,
			max : 10,
			step : 0.5,
			"data-size" : "xxs",
			value : rating
		})
	}
	$("#"+uid).rating()

}
function b_item(elem, com) {
	return function (data) {
		print_item(elem._add_elem("p")._write(com ? com : ""), data)
	}
}

function b_carousel(elem, id, size) {
	return function (data) {
		var c = elem._add_elem("div", {
			id : id,
			class : "carousel slide",
			style : "width :" + size + "px;",
			"data-interval" : "false"
		})
		var i = c._add_elem("div", {
			class : "carousel-inner",
			role : "listbox"
		})
		for (var k in data) {

			i._add_elem("div", {
				class : "item " + (k == 0 ? "active" : "")
			})._add_elem("img", {
				src : img_tmdb(data[k], size)
			})
		}
		c._add_elem("a", {
			class : "left carousel-control",
			onclick : "$('#" + id + "').carousel('prev')",
			role : "button",
			"data-slide" : "prev"
		})
			//._add_elem("span",{class:"glyphicon glyphicon-chevron-left","aria-hidden":"true"})
			c._add_elem("a", {
				class : "right carousel-control",
				onclick : "$('#" + id + "').carousel('next')",
				role : "button",
				"data-slide" : "next"
			})
			//._add_elem("span",{class:"glyphicon glyphicon-chevron-right","aria-hidden":"true"})
		}
	}


	function b_table(elem)
	{
		return function (data,prev)	{
			elem=elem||prev
			var t = elem._add_elem("table",{class : "sortable-theme-bootstrap","data-sortable":true})
	//header
	var h =t._add_elem("thead")._add_elem("tr")
	for ( var i in data[0])
	{
		h._add_elem("th")._write(i)
	}
	
	var b =t._add_elem("tbody")
	for ( var i in data )
	{
		var r = b._add_elem("tr")
		for ( var j in data[i])
		{
			if ( data[i][j].type)
			{
				r._add_elem("td")._add_elem("a", {href : "#get&" + data[i][j].type + "&" + data[i][j].id})._write(data[i][j].name)
			}
			else if (data[i][j].command)
			{
				r._add_elem("td")._add_elem("button", {class: "btn btn-info",onclick:data[i][j].command})._write(data[i][j].name)
			}
			else
			{
				r._add_elem("td")._write(data[i][j])
			}
		}
	}
	sort_table()
}		
}

function b_cond(cond,next)
{
	return function (data)
	{
		if (cond(data))
		{
			next (data)
		}
	}
}


function b_player_video(data)
{
	return function ()
	{
		_get("player")._add_elem("video",{controls:true,autoplay:true})._add_elem("source",{src:data,type:"video/mp4"})		
		b_command("player","Quitter",function (){ return function () {_get("player")._clean()}})()
	}
}

function b_player_audio(data)
{
	return function ()
	{
		_get("player")._clean()._add_elem("audio",{controls:true,autoplay:true})._add_elem("source",{src:data,type:"audio/mpeg"})		
		b_command("player","Quitter",function (){ return function () {_get("player")._clean()}})()
	}
}

function b_playlist_audio()
{
	return function (data)
	{
		player.add(data)
	}
}

function b_switch(elem,name,func)
{
	return function (data)
	{
		elem._add_elem("label",{"for":"cb-"+core.content.id})._write(name)
		var e
		if (data=="yes")
		{
			e=elem._add_elem("input",{type:"checkbox",name:"cb-"+core.content.id,id:"cb-"+core.content.id,checked:"",class:"switch"})
		}
		else
		{
			e=elem._add_elem("input",{type:"checkbox",name:"cb-"+core.content.id,id:"cb-"+core.content.id,class:"switch"})
		}
		$("#cb-"+core.content.id).bootstrapSwitch()
		$("#cb-"+core.content.id).on("switchChange.bootstrapSwitch",function (event,state){func(state)})
	}
}

function b_print_multi_line(elem )
{
	elem._clean()
	return function (data)
	{

		for (var i in data)
		{
			if (data[i]!="")
			{
				elem._write(data[i])._add_elem("br")
			}
			else if ( data[+i+1]=="")
			{
				elem._add_elem("br")
			}
		}
	}
}