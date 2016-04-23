
function build_menu()
{
	var nav = _get("menu")._clean()._add_elem("nav",{class:"navbar navbar-default"})._add_elem("div",{class:"container-fluid"})
	
	nav._add_elem("div",{class:"navbar-header"})._add_elem("a",{class:"glyphicon glyphicon-home",href:"#home"})
	var menu =nav._add_elem("div",{class:"collapse navbar-collapse"})
	var l_menu = menu._add_elem("ul",{class:"nav navbar-nav"})
	menu._add_elem("div",{id:"login-bar"})
	
	var menu_tree= [{name:"Films",content:
		[{name:"Collection",link:"#list&order&name&asc&file&type&movie"},
		{name:"My ratings",link:"#list&order&rate&desc&rated&-1"},
	{name:"My Watchlist",link:"#list&watchlist&-1"}]},
		{name:"Stat",content:
		[{name:"Genre",link:"#table&pref&-1&genre&10"},
		{name:"Keyword",link:"#table&pref&-1&keyword&10"},
		{name:"Actor",link:"#table&pref&-1&cast&10"},
		{name:"Director",link:"#table&pref&-1&director&5"}]},
		{name:"Music",content:
		[{name:"Bands",link:"#list&order&name&asc&type&band"},
		{name:"Albums",link:"#list&order&name&asc&type&album"}]}]
	
	
	//build menu left
	for ( var i in menu_tree)
	{
		var e1= l_menu._add_elem("li",{class:"dropdown"})
	e1._add_elem("a",{class:"dropdown-toggle",role:"button","aria-haspopup":"true","data-toggle":"dropdown"})._write(menu_tree[i].name)._add_elem("span",{class:"caret"})
		var e2= e1._add_elem("ul",{class:"dropdown-menu"})
	for ( var j in menu_tree[i].content)
	{
		e2._add_elem("li")._add_elem("a",{href:menu_tree[i].content[j].link})._write(menu_tree[i].content[j].name)
	}
	}

	
	var search = menu._add_elem("form",{class:"navbar-form navbar-left",role:"search",action:"javascript:search()"})
	search._add_elem("input",{id:"main_search",type:"text",class:"form-control",placeholder:"Search"})
	search._add_elem("button",{type:"submit",class:"btn btn-default"})._write("Submit")

	build_login()
}

function build_login()
{

		if ( getCookie("user"))
	{
		_get("login-bar")._clean()._add_elem("a",{class:"btn btn-default navbar-right",href:"javascript:logout()"})._write("logout ("+getCookie("username")+")")
	}
	else
	{
	_get("login-bar")._clean()._add_elem("a",{class:"btn btn-default navbar-right",href:"javascript:b_login_form()"})._write("login")
	}
}
