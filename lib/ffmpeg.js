
var ffmpeg = require('child_process').spawn.bind(null, 'ffmpeg')

function run (opts, done) {
  var args = genArgs(opts)
  var proc = ffmpeg(args)
}

function metadata (meta, args) {
  args = args || []
  Object.keys(meta).forEach(function (field) {
    args.push('-metadata', field + '=' + meta[field])
  })
  return args
}

function genArgs (data, args) {
  args = args || []

  args.push('-in', data.src)
  metadata(data.meta, args)
  args.push(data.dst)

  return args
}

module.exports = ffmpeg
