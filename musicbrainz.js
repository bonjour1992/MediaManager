var config = require('./config.js');
var http = require('http');
var parseXML = require('xml2js').parseString;

module.exports = {
    query : function (obj,id,inc,success,failure )
    {
      console.log("call to musicbrainz: http://musicbrainz.org/ws/2/"+obj+"/"+id+"?inc="+inc+"&fmt=json")
      var req= http.request(
      {
        hostname:"musicbrainz.org",
        port:80,
        path:"/ws/2/"+obj+"/"+id+"?inc="+inc+"&fmt=json",
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
            try {
                var res= JSON.parse(st)

                
                if(res.error)
                {
                    failure(res.error)
                }
                else
                {
                  success(res)
              }
          }
          catch (e) {
            failure(e)
        }
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
		//console.log("call to musicbrainz: http://musicbrainz.org/ws/2/"+type+"?query="+encodeURIComponent( s))
        var req= http.request(
        {
            hostname:"musicbrainz.org",
            port:80,
            path:"/ws/2/"+type+"?query="+encodeURIComponent( s)+"&fmt=json",
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
                try {
                    success(JSON.parse(st))
                }
                catch (e) {
                    failure(e)
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
