var run = require('../run-program')

var mp3 = module.exports = {
  program: 'eyeD3',
  version: '0.7.5-final',
  unsupported: ['isrc'],
  streaming: false,
  clear: clearmp3,
  write: writemp3
}

var fields = [
  'genre',
  'title',
  'artist',
  'album',
  'comment',
  'track',
  'bpm'
]

function quote (str) {
  return '"' + str + '"'
}

function insert (arr, flag, value) {
  if (value == null) return
  return arr.push('--' + flag, value)
}

function clearmp3 (uri, done) {
  return run(mp3.program, ['--remove-all', '--remove-all-images', uri], done)
}

function writemp3 (uri, meta, done) {
  meta = meta || {}

  var args = []
  var art = meta.art || meta.artwork
  var releaseYear = meta.date || meta["release-year"]
  var date = releaseYear != null ? releaseYear.getFullYear() : null
  var genres = meta.genre || []
  var ins = insert.bind(this, args)

  fields.forEach(function (field) {
    ins(field, meta[field])
  })

  if (date) ins('release-year', date)

  if (meta.date)
    args.push('--recording-date', meta.date.toISOString().substr(0, 19))

  if (art) args.push('--add-image', art + ':OTHER')

  args.push('--to-v2.3', '--encoding', 'utf8', uri)

  return run(mp3.program, args, done)
}
