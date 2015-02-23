
var test = require('tape')
var join = require('path').join
var fs = require('fs')
var debug = require('debug')('media-packager:test:encoder')
var bundle = require('../')

function fixture (file) {
  return join(__dirname, 'fixtures', file)
}

var src = fixture('hellberg.wav')

function item (fmt, n) {
  return {
    src: src,
    encoding: {
      format: fmt
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
  t.plan(9)
  
  var counter = 0
  var items = []
  for (var i = 1; i < 10; ++i) {
    items.push(mp3item(i))
  }
  var bundler = bundle(items)

  bundler.on('progress', function (frame, frames) {
    counter++
    t.equal(counter, frame, 'progress ' + counter + ' found')
    debug('archiver progress %d/%d', frame, frames)
  })

  bundler.on('encoded', function (item) {
    debug('archiver encoded')
  })

  bundler.on('finish', function () {
    debug('archiver finish')
  })

  bundler.pipe(fs.createWriteStream(fixture('var/bundle.zip')))
})
