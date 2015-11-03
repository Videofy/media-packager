
var test = require('tape')
var path = require('path')
var fs = require('fs')
var tagger = require('../lib/tagger')
var mm = require('musicmetadata')
var debug = require('debug')('media-packager:test:tagging')
var rimraf = require('rimraf').sync
var count = require('stream-count')

var metadata = {
  artwork: path.join(__dirname, 'fixtures/art.png'),
  title: 'what',
  artist: 'Hellberg',
  track: 10,
  album: 'Hellberg EP',
  genre: 'Electronic',
  comment: 'This is my jam',
  isrc: 'CA6D21500404'
}

function testTagging (src, settings) {
  var fmt = settings.format
  settings.metadata = settings.metadata || metadata
  var stream = tagger(src, settings)

  test(fmt + ' tagging works', function (t) {
    t.plan(10)

    var out = fs.createWriteStream(path.join(__dirname, 'fixtures/var/hellberg_out.' + fmt))
    stream.pipe(out)

    var parser = mm(stream)

    stream.on('error', function (err) {
      t.error(err)
    })

    stream.on('cleanup', function (tmpfile) {
      t.equal(path.extname(tmpfile), '.' + fmt, "path should have extname of format")
      t.equal(fs.existsSync(tmpfile), false, "tmp file should cleanup after stream")
    })

    parser.on('error', function (err) {
      t.error(err)
    })

    parser.on('genre', function (genre) {
      debug('genre %j', genre)
    })

    function onISRC (result) {
      debug('ISRC', result)
      t.equal(result, metadata.isrc, 'ISRC should match')
    }
    parser.on('TSRC', onISRC)
    parser.on('ISRC', onISRC)

    parser.on('metadata', function (meta){
      var pictures = meta.picture
      var picture = meta.picture[0]
      t.ok(picture, 'should have a picture')
      t.equal(pictures.length, 1, 'should only have one picture')
      delete meta.picture
      debug("metadata %j", meta)
      debug("picture keys %j", Object.keys(picture))
      t.deepEqual(meta.artist, [metadata.artist], 'artist should match')
      t.equal(meta.title, metadata.title, 'title should match')
      t.equal(meta.track.no, metadata.track, 'track number should match')
      t.deepEqual([meta.genre[0].split('/')[0]], ['Electronic'], 'genre should match')
      t.equal(picture && picture.format, 'png', 'picture should be the right format')
    })
  })

  return stream
}

var src = path.join(__dirname, 'fixtures/hellberg.mp3')

if (!module.parent) {
  testTagging(fs.createReadStream(src), {
    format: 'mp3',
    metadata: metadata
  })
}

module.exports = testTagging
