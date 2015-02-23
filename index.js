var EventEmitter = require('events').EventEmitter
var archiver = require('archiver')
var fs = require('fs')
var debug = require('debug')('media-packager')
var tagger = require('./lib/tagger')
var encoder = require('./lib/encoder')
var archiver = require('archiver')
var printf = require('format-text')
var after = require('after')

var join = require('path').join
function vartest (file) {
  return join(__dirname, 'test', 'fixtures', 'var', 'mp3s', file)
}

function bundle (items, opts) {
  opts = opts || {}
  var next = after(items.length, finish)
  var finished = 0
  var archive = archiver('tar', items.archiveSettings || { store: true })
  
  // TODO(jb55): concurrency limits
  items.forEach(function (item, i) { 
    var format = item.encoding.format || item.format
    var src = typeof item.src === 'string' ? fs.createReadStream(item.src) : item.src
    src.pause()
    var encoding = encoder(src, item.encoding)
    var output = tagger(encoding, {format: format, metadata: item.metadata })

    var filename = item.filename || printf('{artist} - {title}.{format}', {
      artist: item.metadata.artist,
      title: item.metadata.title,
      format: format
    })

    src.on('error', function (err) {
      throw err
    })

    encoding.on('error', function (err) {
      throw err
    })

    output.on('error', function (err) {
      throw err
    })

    output.on('finish', function () {
      debug('%d output finish', i)
      archive.emit('progress', ++finished, items.length)
      next()
    })

    output.pipe(fs.createWriteStream(vartest(filename)))

    archive.append(output, { name: filename })
    src.resume()
  })

  function finish (err) {
    debug('archive finalizing', err)
    archive.finalize()
  }

  return archive
}


module.exports = bundle
