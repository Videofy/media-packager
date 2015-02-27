
var test = require('tape')
var join = require('path').join
var fs = require('fs')
var debug = require('debug')('media-packager:test:encoder')
var bundle = require('../')
var count = require('stream-count')
var mkdirp = require('mkdirp')
var roughly = require('./util/roughly')

function fixture (file) {
  return join(__dirname, 'fixtures', file)
}

var src = fixture('hellberg.wav')
var src2 = fixture('Hellberg - Guide Me Home (feat. Charlotte Haining).wav')

function item (fmt, n) {
  return {
    src: src,
    encoding: {
      format: fmt,
      bitRate: 128
    },
    metadata: {
      artwork: fixture('art.png'),
      title: 'what ' + n,
      artist: 'Hellberg',
      track: n,
      album: 'Hellberg EP',
      genre: 'Electronic',
      comment: 'This is my jam'
    }
  }
}

function mp3item (n) {
  return item('mp3', n)
}

test('bundling works', function (t) {
  t.plan(10)
  
  var counter = 0
  var items = []
  var n = 10
  for (var i = 1; i < n; ++i) {
    items.push(mp3item(i))
  }

  mkdirp.sync(fixture('var'))
  var bundler = bundle(items)

  bundler.on('progress', function (frame, frames) {
    counter++
    debug('bundler progress', frame, frames)
    t.equal(counter, frame, 'progress ' + counter + ' found')
  })

  bundler.pipe(fs.createWriteStream(fixture('var/out.zip')))
  count(bundler, function (err, len) {
    roughly(t, len, 4456164, 100*n, 'zip size matches')
  })
})
