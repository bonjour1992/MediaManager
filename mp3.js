
 
function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
} 
run_cmd( "eyeD3", ["/mnt/media/music/Adele/21/01 Rolling in the Deep.mp3"], function(text) { console.log (text) });
