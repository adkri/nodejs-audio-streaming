const fs = require('fs')
const path = require('path')
const express = require('express')
const audioLib = require('./lib')
let app = express()

const audioPath = path.join(__dirname, "./audio"); // Path of your folder with audio files

let audioList = [];
console.log("Building index of audio files at ", audioPath);

audioLib.getAudioList(audioPath, function(err, data) {
  audioList = data;
  console.log("Finished building index");
});

app.get('/', function(req,res) {
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/list', async(req,res) => {
  res.json(audioList);
});

app.get('/play/:id', function(req,res) {
  if(!req.params.id){
    return res.status(400).json({error: "requires a audio id"})
  }

  var audioIndex = audioList.findIndex(item => item.id === req.params.id)

  if(audioIndex < 0 || undefined){
    return res.status(400).json({error: "id didn't match any records"})
  }

  let file = audioList[audioIndex].path

  fs.stat(file, function(err,stats){

    var start, end;
    var total = stats.size;
    
    var range = req.headers.range;
    if(range) {
      var positions = range.replace(/bytes=/, "").split("-");
      start = parseInt(positions[0], 10);
      end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    } else {
      start = 0;
      end = total - 1;
    }
    var chunksize = (end - start) + 1;

    res.writeHead(200, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg"
    });

    var stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      }).on("error", function(err) {
        res.end(err);
      });
  })
})

app.listen(4000)
