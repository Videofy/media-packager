var debug = require('debug')('media-packager:tagger')
var fs = require('fs')
var dezalgo = require('dezalgo')
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

function tmpCopy (fmt, src, done) {
  src.pause()
  var tmpfile = tmp.file({ postfix: '.' + fmt }, function (err, path, fd, cleanup){
    debug("done tmpfile 1")
    if (err) return done(err, path, fd, cleanup)
    src.pipe(fs.createWriteStream(path))
      .on('finish', function () {
        done(err, path, fd, cleanup)
      })
    src.resume()
  })
}

module.exports = function (src, fmt, metadata, cb) {
  var tagger = taggers[fmt]
  var done = dezalgo(finish)
  if (!tagger) return done(Error(fmt + " tagger not supported"))

  var stream = through()
  stream.pause()

  tmpCopy(fmt, src, function (err, path, fd, cleanup) {
    stream.emit('tmpfile', path, fd)
    if (err) return done(err)
    tagger.write(path, metadata, function (err) {
      if (err) return done(err)

      fs.createReadStream(path).pipe(stream)
      .on('end', function clean() {
        fs.unlink(path, stream.emit.bind(null, 'cleanup', path))
      })

      stream.resume()
    })
  })

  function finish (err, res) {
    if (err) stream.emit('error', err)
    return cb && cb(err, res)
  }

  return stream
}
