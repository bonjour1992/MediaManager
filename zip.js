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

    // Create zip with some files. Two dynamic, one static. Put #2 in a sub folder.

    for ( var i in list)
    {
    	zip.file("/mnt/media"+list[i].folder+list[i].filename,{name:list[i].folder.substring(list[i].folder.lastIndexOf('/',list[i].folder.length -2)) +list[i].filename})
    }

        zip.finalize()
	}
}