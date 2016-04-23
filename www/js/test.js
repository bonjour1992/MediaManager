function test_log(l)
{
	var data ={username : l,password :l};
	var xhr= new XMLHttpRequest();
	xhr.responseType = 'json';
	xhr.onload = function ()
	{
		alert(this.response);
	}
	
	xhr.open("POST","api/login");
	xhr.send(JSON.stringify(data));
}
function test_exit()
{

	var xhr= new XMLHttpRequest();
	xhr.open("GET","../exit");
	xhr.send();
}
function test()
{

	var xhr= new XMLHttpRequest();
	xhr.open("GET","../test");
	xhr.onload = function (res)
	{
		alert(xhr.response);
	}
	xhr.send();
}