	var db = require('./db/mysql.js')
	var tmdb = require('./tmdb.js')
	
	var to_process=[]
	var processing
	
	function scan_prop(prop)
	{
		db.get_list_properties(prop,function (res)
		{

			to_process= res
			processing = setInterval(process,1500,prop)
		})
	}
	
	function process (prop)
	{
		tmdb.query(prop+"/" +to_process[0].prop.substring(1),"", function (res)
		{
			db.save(prop,res,"", noop,noop)
			to_process.splice(0, 1)
		})
	}
	
	scan_prop("company")
	
	function noop(){}