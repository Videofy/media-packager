
var test = require('tape')
var join = require('path').join
var fs = require('fs')
var debug = require('debug')('media-packager:test:encoder')
var bundle = require('../')
var count = require('stream-count')
var mkdirp = require('mkdirp')

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

  bundler.on('encoded', function (item) {
    debug('archiver encoded')
  })

  bundler.on('finish', function () {
    debug('archiver finish')
  })

  var entries = []
  debug('piping?')
  
  bundler.on('end', function () {
    debug('bundler end')
  })

  bundler.on('finish', function () {
    debug('bundler finish')
  })

  bundler.on('finalized', function () {
    debug('bundler finalized')
  })

  bundler.on('close', function () {
    debug('bundler close')
  })

  bundler.on('data', function (chunk) {
    if (chunk.length < 30)
      debug('bundler data', chunk.toString())
  })

  bundler.pipe(fs.createWriteStream(fixture('var/out.zip')))
  count(bundler, function (err, len) {
    t.equal(len, 4520594, 'file size matches')
  })

  

// NOTE (jb55): this shit is breaking the stream somehow?
//bundler.pipe(unzip.Parse())
//  .on('entry', function (entry) {
//    debug('unzip entry %s', entry.props.path)
//    entries.push(entry)
//  })
//  .on('end', function () {
//    debug('unzip end')
//  })
//  .on('finish', function () {
//    debug('unzip finish')
//  })
//  .on('pipe', function () {
//    debug('unzip pipe')
//  })
//  .on('error', function (err) {
//    debug('unzip error', err)
//  })
//  .on('drain', function () {
//    debug('unzip drain')
//  })
//  .on('close', function () {
//    debug('unzip close')
//    t.equal(entries.length, n, 'zip has ' + n + ' entries')
//  })

})
