
var test = require('tape')
var path = require('path')
var fs = require('fs')
var tagger = require('../lib/tagger')
var mm = require('musicmetadata')
var debug = require('debug')('media-packager:test:tagging')
var rimraf = require('rimraf').sync

var src = path.join(__dirname, 'fixtures/hellberg.mp3')
var metadata = {
  artwork: path.join(__dirname, 'fixtures/art.png'),
  title: 'what',
  artist: 'Hellberg',
  trackNumber: 10,
  album: 'Hellberg EP',
  genre: 52,
  comment: 'This is my jam'
}

function testTagging (fmt) {
  test(fmt + ' tagging works', function (t) {
    t.plan(7)

    debug('got here')

    var readStream = fs.createReadStream(src)
    var stream = tagger(readStream, fmt, metadata)
    var parser = mm(stream)

    stream.on('error', function (err) {
      t.error(err)
    })

    stream.on('tmpfile', function (tmpfile) {
      t.equal(path.extname(tmpfile), '.' + fmt, "path should have extname of format")
    })

    stream.on('cleanup', function (tmpfile) {
      t.equal(fs.existsSync(tmpfile), false, "tmp file should cleanup after stream")
    })

    parser.on('error', function (err) {
      t.error(err)
    })

    parser.on('metadata', function (meta){
      var picture = meta.picture[0]
      delete meta.picture
      debug("metadata %j", meta)
      debug("picture keys %j", Object.keys(picture))
      t.deepEqual(meta.artist, [metadata.artist], 'artist should match')
      t.equal(meta.title, metadata.title, 'title should match')
      t.equal(meta.track.no, metadata.trackNumber, 'track number should match')
      t.deepEqual(meta.genre, ["Electronic"], 'genre should match')
      t.equal(picture.format, 'png', 'picture should be the right format')
    })
  })
}

testTagging('mp3')
