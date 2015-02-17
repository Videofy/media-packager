var mkdirp = require('mkdirp')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var dezalgo = require('dezalgo')
var encoder = require('./ffmpeg')
var through = require('through2')
var debug = require('debug')('media-packager:encode')
var fs = require('fs')

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
 * @param {number} opts.artwork file path to art
 *
 * @param {string} opts.metadata.title
 * @param {string} opts.metadata.author
 * @param {number} opts.metadata.trackNumber
 * @param {string} opts.metadata.album
 * @param {string} opts.metadata.genre
 * @param {string} opts.metadata.comment
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
    var src = opts.src
    var dst = opts.dst
    var isInputPath = typeof opts.src === 'string'
    var input = isInputPath ? fs.createReadStream(opts.src) : opts.src

    debug("input %j", input)

    if (!src) throw new Error('data.src argument required')

    opts.isPath = isInputPath
    opts.inputType = opts.inputType || isInputPath ? path.extname(opts.src) : "wav"
    opts.format = opts.format || 'mp3'

    opts.sampleRate = opts.sampleRate || 44100
    opts.channelCount = opts.channels || opts.channelCount || 2
    opts.bitRate = opts.bitRate || 320
    opts.bitRate *= 1024
    opts.vbr = opts.vbr == null ? true : opts.vbr
    opts.quality = opts.compression || opts.quality || 5

    mkdirp(path.dirname(dst), function (err) {
      if (err) return done(err)

      var processor = opts.mockEncoder || encoder
      var process = processor(opts)
      input.pipe(process.stdin)

      process.stdout.on('data', function (data) {
        stream.push(data)
      })

      process.stderr.on('data', function (data) {
        debug("ffmpeg stderr %s", data)
      })

      process.stdout.on('error', function (err) {
        stream.emit('error', err)
        stream.push(null)
      })

      process.stdout.on('end', function () {
        debug('data end')
        stream.push(null)
      })
    })
  } catch (err) {
    stream.emit('error', err)
    done(err)
  }

  return stream
}

module.exports = encode
