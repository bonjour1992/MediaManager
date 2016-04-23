	var db = require('./db/mysql.js')
	var tmdb = require('./tmdb.js')
	
	var to_process
	var processing
	
	var prop= {k:"keyword",p:"person",g:"genre",c:"compagnie"}

	
	function scan_prop()
	{
		db.get_list_properties(function (res)
		{
			to_process= res
			processing = setInterval(process,2000)
		})
	}
	
	function process ()
	{
		var type= prop[to_process[0].prop.substring(0,1)]
		if (type)
		{
		tmdb.query(type+"/" +to_process[0].prop.substring(1),"", function (res)
		{
			db.save(type,res,"", noop,noop)
			to_process.splice(0, 1)
		})
		}
	}
	
	scan_prop()
	
	function noop(){}