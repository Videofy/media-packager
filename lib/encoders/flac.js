var flac = require('child_process').spawn.bind(null, 'flac')

function genArgs(opts, args) {
  args = args || []
  args.push('-', '-c')
  return args
}

function run (opts) {
  return flac(genArgs(opts))
}

function version (line) {
  return line.match(/flac ([^\s]+)/)[1]
}

module.exports = run
module.exports.version = version