var test = require('tape')
var join = require('path').join
var fs = require('fs')
var encode = require('../lib/encoder')
var tag = require('../lib/tagger')
var debug = require('debug')('media-packager:test:integration')
var mm = require('musicmetadata')
var testTagging = require('./tagging')
var testEncoding = require('./encode')

function testFormat (src, settings) {
  var fmt = settings.format

  var stream = testEncoding(src, settings)

  testTagging(stream, settings)
  .on('end', function () {
    debug('end tagging')
  })
}

var src = join(__dirname, 'fixtures/hellberg.wav')

testFormat(fs.createReadStream(src), {
  format: 'mp3',
  bitRate: 128,
  expectedSize: 203591,
  vbr: false
})
//testFormat('flac', settings.flac)
