var ffmpeg = require('./ffmpeg')
var flac   = require('./flac')

module.exports = function build (opts) {
  if (opts.format == 'flac') return flac.bind(flac, opts)
  return ffmpeg.bind(ffmpeg, opts)
}