


function table(req, arg1, arg2, arg3, arg4, arg5) // oui arguments existe et alors
{
	var arg = {}
	arg.req = req
		//decode argument
		if (req == "pref") {
			arg.user = arg1
				arg.link = arg2
				if (arg2 == 'cast' || arg2 == 'crew' || arg2 == 'director') {
					arg.type = "p"
					arg.type_full="person"
				} else {
					arg.type = arg2[0]
					arg.type_full=arg2
				}
				arg.limit = arg3
		}
		//structure
		_get("main")._clean()
		var main = _get("main")

		//request
		core.clear()
		core.request("table", arg, "table")
		document.title = req

		core.listener("table", b_panel(main, "table", req, b_table()))
}
