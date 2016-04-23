var config = require('./config.js');
var http = require('http');
var parseXML = require('xml2js').parseString;

module.exports = {
    query : function (method,param,success,failure )
    {
		console.log("call to last fm: ws.audioscrobbler.com/2.0/?method="+method+"&api_key="+config.last_fm_key+format_param(param))
        var req= http.request(
            {
                hostname:"ws.audioscrobbler.com",
				port:80,
				path:"/2.0/?method="+method+"&api_key="+config.last_fm_key+format_param(param),
				method :"GET"
            }, function(res)
            {
                var st='';
                res.on('data',function (chunk)
                {
                    st+=chunk;
                })
                res.on('end',function()
                {
					parseXML(st,function (err,result){success(result)})
                })
            })
            req.on("error",function(e)
            {
				console.log ("error")
                failure(e.message);
            });
            req.end();
    }
    
}

function format_param(param)
{
	var s=""
	for ( var p in param)
	{
		s="&"+p+"="+param[p]
	}
	return s
}