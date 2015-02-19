var debug = require('debug')('media-packager:run-program')
var spawn = require('child_process').spawn

module.exports = function (prgm, args, done) {
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
  })

  program.stderr.on('data', function (data) {
    data = data.toString()
    std.err = (std.err || "") + data
    debug(prgm + 'stderr %s', data)
  })

  program.on('close', function (err) {
    if (err) {
      debug('program close error %s', err)
      return done(err, std)
    }
    return done(null, std)
  })

  return program
}

