
var ffmpeg = require('child_process').spawn.bind(null, 'ffmpeg')
var debug = require('debug')('media-packager:ffmpeg')

function run (opts, done) {
  var args = genArgs(opts)
  return proc = ffmpeg(args)
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

  debug('args %j', args)

  return args
}

module.exports = run
