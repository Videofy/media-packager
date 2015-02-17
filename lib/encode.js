var mkdirp = require('mkdirp')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var dezalgo = require('dezalgo')
var encoder = require('./ffmpeg')
var through = require('through2')

/**
 * Encode a file with optional metadata
 *
 * @param {string} opts.format  mp3,ogg,flac,aac
 * @param {stream} opts.src file path or input stream
 *
 * @param {number} opts.sampleRate [44100]
 * @param {number} opts.channelCount [2]
 * @param {number} opts.bitRate [320]
 * @param {number} opts.compressionQuality [5]
 *
 * @param {string} opts.metadata.title
 * @param {string} opts.metadata.author
 * @param {number} opts.metadata.trackNumber
 * @param {string} opts.metadata.album
 * @param {string} opts.metadata.genre
 * @param {string} opts.metadata.comment
 * @param {string} opts.metadata.artwork file path to art
 *
 * @param {object} opts options
 * @param {function} done called with err if any error
 *
 * @return {stream} encoded file stream
 *   @fires progress x, y
 *   @fires error Error()
 *   @fires end fired when finished
 *
 * @api public
 */
function encode (opts, done) {
  done = done ? dezalgo(done) : function () {}
  var stream = through()

  try {
    opts = opts || {}
    var data = opts.data
    var settings = data.settings || data
    var src = data.src
    var dst = data.dst

    if (!src) throw new Error('data.src argument required')
    if (!dst) throw new Error('data.dst argument required')

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

      var processor = opts.mockEncoder || encoder
      var process = processor({
        src: src,
        dst: dst,
        data: data
      })

      process.stdout.on('data', function (data) {
        stream.push(data)
      })

      process.stdout.on('error', function (err) {
        stream.emit('error', err)
        stream.push(null)
      })

      process.stdout.on('end', function () {
        stream.push(null)
      })
    })
  } catch (err) {
    done(err)
  }

  return stream
}

module.exports = encode
