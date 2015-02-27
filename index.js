var fs = require('fs')
var once = require('once')
var debug = require('debug')('media-packager')
var tagger = require('./lib/tagger')
var encoder = require('./lib/encoder')
var printf = require('format-text')
var spawn = require('child_process').spawn
var join = require('path').join
var async = require('async')
var tmp = require('tmp')
var mkdirp = require('mkdirp')
var Readable = require('readable-stream')

function vartest (file) {
  return join(__dirname, 'test', 'fixtures', 'var', 'mp3s', file)
}

// NOTE (jb55): The only reason I'm doing this is because archiver is broken
// TODO (jb55): Replace me with node module
function zipDir (cwd, dir) {
  var proc = spawn('zip', ['-r', '-', dir], {
    cwd: cwd
  })

  return proc
}

function bundle (items, opts, done) {
  opts = opts || {}
  var chunks = []
  var finished = 0
  var total = items.length
  var stream = Readable()
  stream._read = function(n) {}

  // TODO (jb55): make this streaming
  // NOTE (jb55): for some reason archiver isn't playing nicely with
  //              our streams, need to figure out why
  tmp.dir({ unsafeCleanup: true }, function (err, path, cleanup) {
    if (err) throw err

    var concurrency = opts.concurrency || 6
    var dirName = opts.folderName || items[0].metadata.album || "Music"
    var dstDir = join(path, dirName)
    var work = proc.bind(null, dstDir)

    mkdirp(dstDir, function () {
      async.eachLimit(items, concurrency, work, function (err) {
        if (err) throw err
        var clean = once(function(){
          debug('pushing null')
          stream.push(null)
          debug('cleaning')
          cleanup()
        })

        debug('dstDir %s', dstDir)
        zipDir(path, dirName).stdout
          .on('data', function (chunk, enc) {
            stream.push(chunk, enc)
          })
          .on('end', clean)
      })
    })

  })

  function proc (dir, item, next) {
    var format = item.encoding.format || item.format
    var src = typeof item.src === 'string' ? fs.createReadStream(item.src) : item.src
    var encoding = encoder(src, item.encoding)
    var output = tagger(encoding, {format: format, metadata: item.metadata })

    var filename = item.filename || printf('{artist} - {title}.{format}', {
      artist: item.metadata.artist,
      title: item.metadata.title,
      format: format
    })

    output.pipe(fs.createWriteStream(join(dir, filename)))
      .on('finish', function () {
        stream.emit('progress', ++finished, total)
        next()
      })
  }

  return stream
}


module.exports = bundle
