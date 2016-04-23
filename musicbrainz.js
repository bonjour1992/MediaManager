var config = require('./config.js');
var http = require('http');
var parseXML = require('xml2js').parseString;

module.exports = {
    query : function (obj,id,inc,success,failure )
    {
		console.log("call to musicbrainz: http://musicbrainz.org/ws/2/"+obj+"/"+id+"?inc="+inc)
        var req= http.request(
            {
                hostname:"musicbrainz.org",
				port:80,
				path:"/ws/2/"+obj+"/"+id+"?inc="+inc,
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
					parseXML(st,function (err,result){
						if (err || result.error) { 
						failure(err)

						//exports.query(obj,id,inc,success,failure)
							}
							else{
								success(result.metadata[obj][0])
							}
						})
                })
            })
            req.on("error",function(e)
            {
                failure(e.message)
            });
            req.end();
    },
    
	search : function (type,s,success,failure)
	 {
		console.log("call to musicbrainz: http://musicbrainz.org/ws/2/"+type+"?query="+encodeURIComponent( s))
        var req= http.request(
            {
                hostname:"musicbrainz.org",
				port:80,
				path:"/ws/2/"+type+"?query="+encodeURIComponent( s),
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
					parseXML(st,function (err,result){
						if (err || result.error|| !result.metadata[type+"-list"]) { 
						failure(err)
						//exports.query(obj,id,inc,success,failure)
							}
							else{
								//console.log(result.metadata[type+"-list"][0][type])
								success(result.metadata[type+"-list"][0][type])
							}
						})
                })
            })
            req.on("error",function(e)
            {
                failure(e.message)
            });
            req.end();
    }
	
}
