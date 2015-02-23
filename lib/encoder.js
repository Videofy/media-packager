var mkdirp = require('mkdirp')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var dezalgo = require('dezalgo')
var encoder = require('./ffmpeg')
var through = require('through2')
var debug = require('debug')('media-packager:encoder')
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
function encode (src, opts, done) {
  done = done ? dezalgo(done) : function () {}
  var stream = through()

  try {
    opts = opts || {}
    var isInputPath = typeof src === 'string'
    var input = isInputPath ? fs.createReadStream(src) : src

    if (!src) throw new Error('src argument required')

    opts.isPath = isInputPath
    opts.inputFormat = opts.inputFormat || isInputPath ? path.extname(src) : "wav"
    opts.format = opts.format || 'mp3'

    opts.sampleRate = opts.sampleRate || 44100
    opts.channelCount = opts.channels || opts.channelCount || 2
    opts.bitRate = opts.bitRate || 320
    opts.vbr = opts.vbr == null ? true : opts.vbr
    opts.quality = opts.compression || opts.quality || 5

    var stderr = ""
    var processor = opts.mockEncoder || encoder
    var process = processor(opts)
    input.pipe(process.stdin)

    process.stdin.on('error', function (err){
      debug("input err %j", err)
    })

    process.stdout.on('data', function (data) {
      stream.push(data)
    })

    process.on('exit', function (code) {
      debug("ffmpeg exit %d", code)
      if (code > 0) throw Error("ffmpeg exit code " + code + ":\n\n" + stderr)
    })

    process.stderr.on('data', function (data) {
      debug("ffmpeg stderr %s", data)
    })

    process.stdout.on('error', function (err) {
      debug('ffmpeg stdout error %j', err)
      stream.emit('error', err)
      stream.push(null)
    })

    process.stdout.on('end', function () {
      debug('data end')
      stream.push(null)
    })
  } catch (err) {
    debug('ffmpeg caught error %j', err)
    stream.emit('error', err)
    done(err)
  }

  return stream
}

module.exports = encode
