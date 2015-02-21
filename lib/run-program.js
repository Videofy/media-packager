var debug = require('debug')('media-packager:run-program')
var dezalgo = require('dezalgo')
var spawn = require('child_process').spawn

module.exports = function (prgm, args, done) {
  done = dezalgo(done)
  debug(prgm + ': ' + (args.join(' ')))
  var std = {
    out: null,
    err: null
  }

  var program = spawn(prgm, args)
  program.stdout.setEncoding('utf8')
  program.stderr.setEncoding('utf8')

  program.stdout.on('data', function (data) {
    data = data.toString()
    std.out = (std.out || "") + data
    if (+process.env.DEBUG_VERBOSE >= 1)
      debug(prgm + ' stdout %s', data)
  })

  program.stderr.on('data', function (data) {
    data = data.toString()
    std.err = (std.err || "") + data
    debug(prgm + ' stderr %s', data)
  })

  program.on('close', function (code) {
    if (code !== 0) {
      debug('program close error %d', code)
      return done(Error(prgm + " exited with status code " + code + "\n" + std.err), std)
    }
    return done(null, std)
  })

  return program
}

