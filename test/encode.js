var test = require('tape')
var join = require('path').join
var fs = require('fs')
var FLAC = require('flac-parser')
var encode = require('../lib/encoder')
var clone = require('clone')
var debug = require('debug')('media-packager:test:encoder')
var rimraf = require('rimraf').sync
var through = require('through2')
var count = require('stream-count')
var EventEmitter = require('events').EventEmitter
var util = require('util')
var roughly = require('./util/roughly')

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
      roughly(t, len, settings.expectedSize, 20)
    })
  })

  return stream
}

var src = join(__dirname, 'fixtures/hellberg.wav')
var dst = join(__dirname, 'fixtures/var/hellberg_out.flac')

if (!module.parent) {
  testEncoding(fs.createReadStream(src), {
    format: 'flac',
    expectedSize: 1244422
  })

  testEncoding(fs.createReadStream(src), {
    format: 'mp3',
    bitRate: 320,
    out: "320.mp3",
    expectedSize: 508910
  })

  test('flac should have nonzero length', function (t) {
    t.plan(2)
    var stream = encode(src, {
      format: 'flac',
      out: "non-zero-len.flac"
    })

    var parser = stream.pipe(new FLAC())
    parser.on('data', function (tag) {
      switch (tag.type) {
      case 'duration':
        t.not(tag.value, 0, 'duration should be greater than zero')
        break;
      case 'samplesInStream':
        t.not(tag.value, 0, 'samplesInStream shouldnt be zero')
      }
    })
  })
}

module.exports = testEncoding
