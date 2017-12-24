const fs = require('fs')
const path = require('path')
var randomId = require('random-id')

function generateId() {
  return randomId(10, "aAaA")
}
  
var getAllFiles = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          getAllFiles(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};
                

function audioList(dir, done) {
  let audio = [];
  getAllFiles(dir, function(err,results) {
    if(err) return(err, null);
    audio = results.filter(item => {
      return path.extname(item) == '.mp3';
    }).map(item => {
      return {
      "id": generateId(),
      "name":  path.basename(item, path.extname(item)),
      "path" : item
      }
    })
    done(null,audio);
  })
}

module.exports = {
  getAudioList: audioList
};