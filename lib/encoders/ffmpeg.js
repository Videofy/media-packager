
var ffmpeg = require('child_process').spawn.bind(null, 'ffmpeg')
var debug = require('debug')('media-packager:ffmpeg')

function version (line)  {
  return line.match(/ffmpeg version ([^\s]+)/)[1]
}

function cbr (bitrate) {
  debug('choosing cbr for bitRate ' + bitrate)
  return ['-ab', bitrate + 'k']
}

function vbr (quality) {
  return ['-qscale:a', quality]
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

function run (opts) {
  var args = genArgs(opts)
  var proc = ffmpeg(args)
  return proc
}

function metadata (meta, args) {
  args = args || []
  args.push("-id3v2_version", "3")
  args.push("-write_id3v1", "1")
  args.push("-write_xing", "0")
  Object.keys(meta).forEach(function (field) {
    args.push('-metadata', field + '=' + meta[field])
  })
  return args
}

function genArgs (opts, args) {
  args = args || []

  args.push('-i', "pipe:0")

  if (opts.artwork)
    args.push('-i', opts.artwork)

  var bitRate = opts.bitRate || opts.bitrate || opts.b
  var quality = opts.quality || opts.V || opts.qscale

  // NOTE (jb55): if we have quality, assume we want vbr
  if (quality != null) {
    args = args.concat(vbr(quality))
  }
  // otherwise we probably want cbr?
  else if (bitRate != null) {
    args = args.concat(cbr(bitRate))
  }
  // otherwise just use V0
  else {
    debug("no quality chosen, using V0")
    args = args.concat(vbr(0))
  }

  //ffmpeg sucks at this
  //metadata(opts.metadata, args)

  args.push("-f", opts.format)
  args.push(!!opts.dst ? opts.dst : "pipe:1")

  debug('args %j', args)

  return args
}

module.exports = run
module.exports.version = version
