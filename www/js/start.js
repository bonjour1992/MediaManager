

function start()
{

		build_menu()
		move_to()

}

function logout()
{
	deleteCookie("user")
	deleteCookie("username")
	deleteCookie("usertoken")
	b_login_form()
	build_login()
}

function b_login_form()
{
    var f= _get("main")._clean()._add_elem("form",{id : "login_form"});
    f.onsubmit=send_login
	f._add_elem("p")._write("You need to connect before you can continue")
	f._add_elem("p",{"id":"f_result"});
    f._write("username : ")._add_elem("input",{id :"f_username",type:"text"});
    f._write("password : ")._add_elem("input",{id:"f_password",type:"password"});
    f._add_elem("input",{"type" : "submit","value":"log in"});
}

function send_login()
{
	if (location.hash=="#logout"||location.hash=="#b_login_form")
	{
	location.hash = "#home"
	}
    api("login",{username :_get("f_username").value,password : _get("f_password").value},{200 : function (res)
    {
		build_login()
        move_to()
    },401 : function(res)
    {
        _get("f_result")._write(res.err,true)
    }
    });
	return false
}

function home()
{

    list("named",1)
	
}