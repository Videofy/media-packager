
var test = require('tape')
var join = require('path').join
var fs = require('fs')
var tagger = require('../lib/tagger')
var mm = require('musicmetadata')
var debug = require('debug')('media-packager:test:tagging')
var rimraf = require('rimraf').sync

var metadata = {
  artwork: join(__dirname, 'fixtures/art.png'),
  title: 'what',
  artist: 'Hellberg',
  track: 10,
  album: 'Hellberg EP',
  genre: 'Electronic',
  comment: 'This is my jam'
}

function testTagging (fmt) {
  test(fmt + ' tagging works', function (t) {
    t.plan(6)

    debug('got here')

    var stream = fs.createReadStream(src)
                 .pipe(tagger(metadata))

    var parser = mm(stream)

    parser.on('error', function (err) {
      t.error(err)
    })

    parser.on('metadata', function (meta){
      t.equal(meta.artist, [metadata.artist])
      t.equal(meta.title, metadata.title)
      t.equal(meta.track.no, metadata.track)
      t.equal(meta.genre, ["Electronic"])
      t.equal(meta.picture.format, 'png')

      // compare hash of picture
      // t.equal(meta.picture.data, 'png')
      t.equal(meta.artist, metadata.artist)
    })
  })
}

testTagging('mp3')
