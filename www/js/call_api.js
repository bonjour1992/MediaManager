function api(method,data,callback)
{
    return $.ajax({
            url : "../api/"+method  , 
            type : "POST",
            data : JSON.stringify(data),
			contentType: "application/json",
            datatype:"json",
            mimeType : "json"
        }).always(function (res,status,xhr)
        {
			if (status != "success") 
			{
				xhr=res
				res= JSON.parse(res.responseText)
			}
			if ( callback[xhr.status])
			{
				callback[xhr.status](res)
			}
			else
			{
				console.log("call : "+method+" unexpected status "+xhr.status+ " error detail :"+ res.err)
			}
		})
}

function rate (media,value,cb)
{
	api ("rate",{type:media.type,id:media.id,value:value},{200:cb,403:logout})
}
function unrate (media,value,cb)
{
	api ("unrate",{type:media.type,id:media.id},{200:cb,403:logout})
}

function watchlist(media,on,cb)
{

	api("watchlist",{type:media.type,id:media.id,state:on},{200:cb,403:logout})

}