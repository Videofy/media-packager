var run = require('../run-program')

var mp3 = module.exports = {
  program: 'eyeD3',
  version: '0.7.5-final',
  unsupported: ['isrc'],
  streaming: false,
  clear: clearmp3,
  write: writemp3
}

function insert (arr, flag, value) {
  if (value == null) return
  return arr.push('-' + flag, value)
}

function clearmp3 (uri, done) {
  return run(mp3.program, ['--remove-all', '--remove-all-images', uri], done)
}

function writemp3 (uri, meta, done) {
  meta = meta || {}

  var args = []
  var date = meta.date != null ? meta.date.getFullYear() : null
  var genres = meta.genres ? meta.genres.join(', ') : null

  var ins = insert.bind(this, args)
  ins('t', meta.title)
  ins('a', meta.artist)
  ins('A', meta.album)
  ins('n', meta.trackNumber)
  ins('c', meta.comments)

  if (date) ins('Y', date)
  if (genres) ins('G', genres)

  if (meta.date) {
    args.push('--recording-date', meta.date.toISOString().substr(0, 19))
  }

  if (meta.art) {
    args.push('--add-image', meta.art + ':OTHER')
  }

  args.push('--to-v2.3', '--encoding', 'utf8', uri)

  return run(mp3.program, args, done)
}
