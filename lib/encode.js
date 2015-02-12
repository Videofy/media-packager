var mkdirp = require('mkdirp')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var dezalgo = require('dezalgo')
var encoder = require('./ffmpeg')

/**
 * Encode a file with optional metadata
 *
 * opts.format {mp3,ogg,flac,aac} optional if inferred from destination
 * opts.src source file
 *
 * opts.settings
 *   - sampleRate 44100
 *   - channelCount 2
 *   - bitRate 320
 *   - compressionQuality 5
 *
 * opts.metadata
 *   - title
 *   - author
 *   - trackNumber
 *   - album
 *   - genre
 *   - comment
 *   - artwork
 *
 * @param {Object} opts options
 * @param {Function} done called with err if any error
 *
 * @return {EventEmitter} event emitter with the following events
 *   @fires progress x, y
 *   @fires error Error()
 *   @fires end fired when finished
 *
 * @api public
 */
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
