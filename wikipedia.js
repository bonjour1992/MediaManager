var config = require('./config.js');
var http = require('https');



module.exports = {
    query : function (obj,s,success,failure )
    {
		console.log("call to musicbrainz: http://en.wikipedia.org//w/api.php?format=json&action=query&prop="+obj+"&titles="+s)
        var req= http.request(
            {
                hostname:"en.wikipedia.org",
				port:443,
				path:"/w/api.php?format=json&action=query&prop="+obj+"&titles="+s.replace(/ /g,"_"),
				method :"GET",
				headers: {'user-agent': 'media manager (contact:bonjour1992@laposte.net)'},
            }, function(res)
            {
                var st='';
                res.on('data',function (chunk)
                {
                    st+=chunk;
                })
                res.on('end',function()
                {
					var data = JSON.parse(st)
                            if (data.query)
                            {
								success(data.query.pages[Object.keys(data.query.pages)[0]])
                            }
                            else
                            {
                                failure(data)
                            }

						})

            })
            req.on("error",function(e)
            {
                failure(e.message)
            });
            req.end();
    }
	
}
