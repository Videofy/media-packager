var test = require('tape')
var join = require('path').join
var encode = require('../lib/encode')
var clone = require('clone')
var count = require('stream-count')
var hashStream = require('hash-stream')

var settings = {
  format: 'mp3',
  src: join(__dirname, 'fixtures/hellberg.mp3'),
  metadata: {
    title: 'こんにちは世界',
    author: 'Hellberg',
    trackNumber: 10,
    album: 'Hellberg EP',
    genre: 'Electronic',
    comment: 'This is my jam',
    artwork: join(__dirname, 'fixtures/art.png')
  }
}

function testFormat (fmt) {
  test('conversion to ' + fmt + ' works', function (t) {
    t.plan(2)

    var opts = clone(settings)
    opts.format = fmt
    var stream = encode(opts)

    hashStream(stream, 'md5', function (err, hash) {
      t.ok(err)
      t.equal(hash, "hey")
    })
  })
}

testFormat('mp3')
