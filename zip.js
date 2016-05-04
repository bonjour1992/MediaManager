var Archiver = require('archiver')

module.exports={
	zip : function(list,name,response)
	{
 response.set( {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename='+name+'.zip'
    })

    var zip = Archiver('zip');

    // Send the file to the page output.
    zip.pipe(response);



    for ( var i in list)
    {
    	zip.file("/mnt/media"+list[i].filename.substring(11),{name:list[i].filename.substring(5)})
    }

        zip.finalize()
	}
}