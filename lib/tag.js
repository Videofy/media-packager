var debug = require('debug')('mc-connect:meta')
var fs = require('fs')
var through = require('through2')
var tmp = require('tmp')

function find (xs, fn) {
  for (var i = 0; i < xs.length; i++) {
    var x = xs[i]
    if (fn(x)) return x
  }
}

taggers = {
  mp3: require('./taggers/mp3'),
  flac: require('./taggers/flac')
}

function copyFile

module.exports = function (fmt, src, done) {
  var stream = through()

  var tmpfile = tmp.file(function (err, path, fd, cleanup){
    src = typeof src === 'string' ? fs.createReadStream(src) : src

    // make a copy for eyeD3
    fs.createReadStream(src)
      .pipe(createWriteStream(null, { fd: fd }))
  })

  return stream
}
