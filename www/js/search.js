
function search()
{

	
	//structure
	_get("main")._clean()
	var main = _get("main")
	

	
	//request
	core.clear()
	core.request("search",{text:_get("main_search").value},"result")
	
	
	core.listener("result",b_panel(main,"Result","Result",b_list_cover_printer()))

}