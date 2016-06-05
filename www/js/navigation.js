function move_to()
{
	var str=location.hash.substr(1)
    var queryDict = {}
    var req = str.split("&")
    if (typeof (req[0]) != "undefined" && req[0]!="")
    {

        var s = req[0] + "("
        var i = 1
        while (i < req.length)
        {
            if (i != 1)
                s += ","
            s += '"' + req[i] + '"'
            i++
        }
        s += ");"
        eval(s)

    }
    else
    {
        b_home()
    }

}

function get(type,id)
{
	if (type=="tv" || type=="person" || type=="movie"|| type=="band"||type=="album"||type=="song")
	{
		media(type,id)
	}
	else
	{
		list(type,id)
	}
}

function listen(type,id)
{
        core.clear()
    core.init(type,id)
        core.listener("playlist",b_playlist_audio())
        core.request("playlist",{id:id,type:type},"playlist")
}