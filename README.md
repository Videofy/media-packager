
# media-packager

  [![Build Status](https://travis-ci.org/monstercat/media-packager.svg)](https://travis-ci.org/monstercat/media-packager)

  Packages media!

## Example

```js
var media = require('media-packager')

var input = fs.createReadStream('in.wav')

// encode
var encoding = media.encoder(input, {
  format: 'mp3',
  quality: 0, // V0
});

// tag
var tagged = media.tagger(encoding, {
  format: 'mp3',
  metadata: {
    title: 'my title',
    genre: 'Electronic',
    artist: 'My Artist',
    album: 'My Album',
    comment: 'Comments',
    track: 10,
    bpm: 128
  }
});

tagged
.pipe(fs.createWriteStream('out.mp3'))

// packaging
// TODO docs
```

## License

  The MIT License (MIT)

  Copyright (c) 2014 William Casarin

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
