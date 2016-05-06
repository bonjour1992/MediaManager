var Transmission = require('transmission');
var transmission = new Transmission({
    port: 7300,         // DEFAULT : 9091
    host: "127.0.0.1",         // DEAFULT : 127.0.0.1
    username: 'titou',   // DEFAULT : BLANK
    password: '1AQWSE4'    // DEFAULT : BLANK
});



// Get details of all torrents currently queued in transmission app
module.exports={
    getTransmissionStats:function (){
        transmission.sessionStats(function(err, result){
            if(err){
                console.log(err)
            } else {
                console.log(result)
            }
        });
    },


// Add a torrent by passing a URL to .torrent file or a magnet link
addTorrent:function (url,type){
    transmission.addUrl(url, {
        "download-dir" : "/mnt/media/temp/"+type+"/"
    }, function(err, result) {
        if (err) {
            return console.log(err)
        }
        var id = result.id
        console.log('Just added a new torrent.')
        console.log('Torrent ID: ' + id)
    });
},

// Get various stats about a torrent in the queue
getTorrentDetails:function (id) {
    transmission.get(id, function(err, result) {
        if (err) {
            throw err;
        }
        if(result.torrents.length > 0){
            // console.log(result.torrents[0]);         // Gets all details
            console.log("Name = "+ result.torrents[0].name);
            console.log("Download Rate = "+ result.torrents[0].rateDownload/1000);
            console.log("Upload Rate = "+ result.torrents[0].rateUpload/1000);
            console.log("Completed = "+ result.torrents[0].percentDone*100);
            console.log("ETA = "+ result.torrents[0].eta/3600);
            console.log("Status = "+ getStatusType(result.torrents[0].status));
        }
    });
},

deleteTorrent:function (id){
    transmission.remove(id, true, function(err, result){
        if (err){
            console.log(err);
        } else {
            console.log(result);// Read this output to get more details which can be accessed as shown below.
            // Extra details
            console.log('bt.get returned ' + result.torrents.length + ' torrents');
            result.torrents.forEach(function(torrent) {
                console.log('hashString', torrent.hashString)
            });
            removeTorrent(id);
        }
    });
}
}