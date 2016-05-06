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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

    function s_to_minsec(t)
    {
        t=Math.floor(t)
        return Math.floor(t/60)+":"+((t%60<10)?"0"+t%60:t%60)
    }