var run = require('run-program')

var flac = {
  program: 'metaflac',
  version: '1.3.0',
  unsupported: ['comments'],
  versionInstalled: flacVersionInstalled,
  clear: clearFlac,
  write: writeFlac,
  read: readFlac
}

var show = function (str) {
  return '--show-tag=' + str
}

function showtags (arr) {
  var tags
  return tags = arr.map(function (tag) {
    return show(tag.toUpperCase())
  })
}

function insert (arr, key, value) {
  if (value == null) {
    return
  }
  return arr.push('--set-tag=' + key + '=' + value)
}

var map = {
  album: 'ALBUM',
  artist: 'ARTIST',
  date: 'DATE',
  genres: 'GENRE',
  isrc: 'ISRC',
  title: 'TITLE',
  track: 'TRACKNUMBER'
}

function flacVersionInstalled (done) {
  return run(flac.program, ['--version'], function (err, data) {
    if (err) return done(err)
    var matches = data.out.toString().match(/^metaflac (\d\.\d\.\d[\w\d-]*)/i) || []
    return done(void 0, matches[1])
  })
}

function writeFlac (uri, meta, done) {
  var args, date, genres, ins
  var art = meta.art || meta.artwork
  if (meta == null) {
    meta = {}
  }
  args = []
  ins = insert.bind(this, args)
  date = meta.date ? meta.date.toISOString().substr(0, 19) : null
  ins('TITLE', meta.title)
  ins('ARTIST', meta.artist)
  ins('ALBUM', meta.album)
  ins('DATE', date)
  ins('TRACKNUMBER', meta.track)
  ins('GENRE', meta.genre)
  ins('ISRC', meta.isrc)
  if (art) {
    args.push('--import-picture-from', art)
  }
  args.push(uri)
  return run(flac.program, args, done)
}

function readFlac (uri, done) {
  var meta = {}
  var tags = ['title', 'artist', 'album', 'date', 'tracknumber', 'genre', 'isrc']
  return run(flac.program, showtags(tags).concat(uri), function (err, std) {

    for (var k in map) {
      var v = map[k]
      var rex = new RegExp('^' + v + '=(.*)', 'm')
      var matches = std.out.match(rex)
      if (matches && matches.length > 1) {
        meta[k] = matches[1]
      }
    }

    if (meta.date) {
      meta.date = new Date(meta.date)
    }

    if (meta.genres) {
      meta.genres = meta.genres.split(',').map(function (genre) {
        return genre.trim()
      })
    }

    return done(err, meta)
  })

}

function clearFlac (uri, done) {
  var args = ['--remove-all', '--dont-use-padding', uri]
  return run(flac.program, args, done)
}

module.exports = flac


