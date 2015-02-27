var test = require('tape')
var join = require('path').join
var fs = require('fs')
var encode = require('../lib/encoder')
var clone = require('clone')
var debug = require('debug')('media-packager:test:encoder')
var rimraf = require('rimraf').sync
var through = require('through2')
var count = require('stream-count')
var EventEmitter = require('events').EventEmitter

function fixture (p) {
  return join(__dirname, 'fixtures', p)
}

function testEncoding (src, settings) {
  var stream = encode(src, settings)
  var events = new EventEmitter()

  count(stream, function (err, len) {
    events.emit('count', err, len)
  })

  if (settings.out)
    stream.pipe(fs.createWriteStream(fixture('var/' + settings.out)))

  test(settings.format + ' encoding works', function (t) {
    t.plan(2)

    stream.on('error', function (err){
      t.error(err)
    })

    events.on('count', function (err, len) {
      t.error(err)
      var msg = settings.bitRate + ' ' + settings.format + ' should be roughly the right size'
      t.equal(len, settings.expectedSize, msg)
    })
  })

  return stream
}

var src = join(__dirname, 'fixtures/hellberg.wav')
var dst = join(__dirname, 'fixtures/var/hellberg_out.flac')

if (!module.parent) {
  testEncoding(fs.createReadStream(src), {
    format: 'flac',
    expectedSize: 1248305
  })

  testEncoding(fs.createReadStream(src), {
    format: 'mp3',
    bitRate: 320,
    out: "320.mp3",
    expectedSize: 508910
  })
}

module.exports = testEncoding
