
var ffmpeg = require('child_process').spawn.bind(null, 'ffmpeg')
var debug = require('debug')('media-packager:ffmpeg')

function cbr(bitrate) {
  return ['-b:a', bitrate + 'k']
}

function vbr(bitrate) {
  var quality = determineQuality(bitrate)
  return ['-q:a', quality]
}

function determineQuality(bitrate) {
  if (bitrate >= 220) return 0;
  if (bitrate >= 190) return 1;
  if (bitrate >= 170) return 2;
  if (bitrate >= 150) return 3;
  if (bitrate >= 140) return 4;
  if (bitrate >= 120) return 5;
  if (bitrate >= 100) return 6;
  if (bitrate >= 80)  return 7;
  if (bitrate >= 70)  return 8;
  return 9;
}

function run (opts, done) {
  var args = genArgs(opts)
  var proc = ffmpeg(args)
  return proc
}

function metadata (meta, args) {
  args = args || []
  Object.keys(meta).forEach(function (field) {
    args.push('-metadata:s:v', field + '=' + meta[field])
  })
  return args
}

function genArgs (opts, args) {
  args = args || []

  args.push('-i', "pipe:0")
  if (opts.artwork)
    args.push('-i', opts.artwork)

  var quality = opts.quality || 5
  args.concat(opts.vbr ? vbr(quality) : cbr(quality))

  metadata(opts.metadata, args)

  args.push("-f", opts.format)
  args.push(!!opts.dst ? opts.dst : "pipe:1")

  debug('args %j', args)

  return args
}

module.exports = run
