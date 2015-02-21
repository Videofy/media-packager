var test = require('tape')
var join = require('path').join
var fs = require('fs')
var encode = require('../lib/encode')
var clone = require('clone')
var debug = require('debug')('media-packager:test:encode')
var rimraf = require('rimraf').sync
var through = require('through2')

function testEncoding (src, settings) {
  var stream = encode(src, settings)

  test(settings.format + ' encoding works', function (t) {
    t.plan(1)

    stream.on('error', function (err){
      t.error(err)
    })

    stream.on('end', function (err){
      t.ok(true, 'encoded successfully')
    })
  })

  return stream
}

if (!module.parent) {
  var src = join(__dirname, 'fixtures/hellberg.wav')
  var dst = join(__dirname, 'fixtures/var/hellberg_out.flac')

  testEncoding(fs.createReadStream(src), { format: 'flac' })
  .pipe(fs.createWriteStream(dst))
}

module.exports = testEncoding
