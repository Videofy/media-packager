var EventEmitter = require('events').EventEmitter
var archiver = require('archiver')
var tagger = require('./lib/tagger')

function encode (opts, done) {
}

function bundle (opts) {
  var events = new EventEmitter()

  /* opts.formats = ["mp3", "flac", "ogg"]
   *
   */

  encode

  return events
}
