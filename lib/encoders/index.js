var ffmpeg = require('./ffmpeg')
var flac   = require('./flac')

module.exports = function build (opts) {
  if (opts.format == 'flac') return flac
  return ffmpeg
}