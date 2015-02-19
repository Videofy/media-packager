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

function tmpCopy (src, done) {
  var tmpfile = tmp.file(function (err, path, fd, cleanup){
    if (err) return done(err, path, fd, cleanup)
    src.pipe(fs.createWriteStream(path))
    .on('end', function () {
      done(path, fd, cleanup)
    })
  })
}

module.exports = function (fmt, src, done) {
  var tagger = taggers[fmt]
  if (!tagger) return done(Error(fmt + " tagger not supported"))

  var stream = through()

  var isStreaming = tagger.streaming
  src = typeof src === 'string' ? fs.createReadStream(src) : src

  if (!isStreaming) {
    tmpCopy(src, function (err, path) {
      if (err) return done(err)

    })
  } else {
  }

  return stream
}
