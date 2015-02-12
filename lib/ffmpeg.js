
var run = require('fluent-ffmpeg')

function ffmpeg (opts, done) {
}

function metadata (meta) {
  return concatMap(Object.keys(meta), function (field) {
    return ['-metadata', field + '=' + meta[field]]
  })
}

function ffmpegOptions (data) {
}

module.exports = ffmpeg
