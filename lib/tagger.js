var debug = require('debug')('media-packager:tagger')
var fs = require('fs')
var dezalgo = require('dezalgo')
var through = require('through2')
var tmp = require('tmp')

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

module.exports = function (src, opts, cb) {
  var fmt = opts.format
  var metadata = opts.metadata

  var stream = through()
  stream.pause()
  var tagger = taggers[fmt]
  var done = dezalgo(finish)

  if (!tagger) {
    done(Error(fmt + " tagger not supported"))
    return stream
  }

  tmpCopy(fmt, src, function (err, path, fd, cleanup) {
    debug('emitting tmpfile')
    stream.emit('tmpfile', path, fd)
    if (err) return done(err)
    tagger.write(path, metadata, function (err) {
      if (err) return done(err)

      var readStream = fs.createReadStream(path)
      readStream.pipe(stream)
      readStream.on('end', function clean() {
        fs.unlink(path, function (){
          fs.close(fd)
          debug("unlinked tmpfile")
          stream.emit("cleanup", path)
        })
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
