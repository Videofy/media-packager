var mkdirp = require('mkdirp')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var dezalgo = require('dezalgo')
var concatMap = require('concat-map')
var encoder = require('./ffmpeg')

function encode (opts, done) {
  done = dezalgo(done)
  var events = opts.events || new EventEmitter()

  try {
    opts = opts || {}
    var data = opts.data
    var settings = data.settings || data
    var src = data.src
    var dst = data.dst

    opts.format = settings.format || data.format || 'mp3'
    if (opts.format !== 'flac') {
      opts.sampleRate = settings.sampleRate || 44100
      opts.channelCount = settings.channels || settings.channelCount || 2
      opts.bitRate = settings.bitRate || 320
      opts.bitRate *= 1024
      opts.compressionQuality = settings.compression || settings.compressionQuality || 5
    }

    mkdirp(path.dirname(dst), function (err) {
      if (err) return done(err)

      var transcode = encoder({
        src: src,
        dst: dst,
        data: data
      })

      transcode.on('progress', function (x, y) {
        events.emit('progress', x, y)
      })

      transcode.on('error', function (err) {
        done(err)
      })

      transcode.on('end', function () {
        done()
      })

      transcode.start()
    })
  } catch (err) {
    done(err)
  }

  return events
}

module.exports = encode
