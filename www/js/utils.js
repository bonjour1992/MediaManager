function getCookie(cname) {
    var name = cname + "="
    var ca = document.cookie.split(';')
    for(var i=0; i<ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0)==' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
    }
    return "";
}
 
 function deleteCookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
 
 function img_tmdb(img,size)
 {
	 if (img.substring(0, 4)!=="http" && img.substring(0, 4)!=="data")
	 {
	 return "http://image.tmdb.org/t/p/w"+size+img
	 }
	 else 
		 return img 
 }
 
 function noop()
 {
	return
 }
 
 function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function video_check(filename)
{
	return filename.substring(filename.length-4)==".mp4"
}

function audio_check(filename)
{
	return filename.substring(filename.length-4)==".mp3"
}