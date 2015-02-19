var test = require('tape')
var join = require('path').join
var fs = require('fs')
var encode = require('../lib/encode')
var clone = require('clone')
var count = require('stream-count')
var hashStream = require('hash-stream')
var mm = require('musicmetadata')
var id3parser = require('id3v2-parser')
var debug = require('debug')('media-packager:test:encode')
var rimraf = require('rimraf').sync

var dst = join(__dirname, 'fixtures/var/hellberg_out.mp3')
var settings = {
  format: 'mp3',
  bitRate: 320,
  vbr: false,
  src: join(__dirname, 'fixtures/hellberg.mp3'),
  artwork: join(__dirname, 'fixtures/art.png'),
  metadata: {
    title: 'what',
    artist: 'Hellberg',
    track: 10,
    album: 'Hellberg EP',
    genre: 'Electronic',
    comment: 'This is my jam',
  }
}

function testFormat (fmt) {
  rimraf(dst)
  test('conversion to ' + fmt + ' works', function (t) {
    t.plan(3)

    var opts = clone(settings)
    opts.format = fmt
    var stream = encode(opts)
    stream.pause()
    var parser = id3parser()

    stream.pipe(fs.createWriteStream(dst))
    stream.pipe(parser)
    stream.resume()

    stream.on('error', function (err){
      t.error(err)
    })

    parser.on('data', function (tag) {
      debug('tag %s %s', tag.type, tag.value)
      t.equal('artist', ['Hellberg'])
      t.equal('album', 'Hellberg EP')
    })

    parser.on('error', function (err){
      t.error(err)
    })

  })
}

//testFormat('mp3')
