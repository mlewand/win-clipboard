# win-clipboard [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

An experimental Node.js module that provides you a full control over host clipboard in Windows environment.

## Installation

```sh
$ npm install --save win-clipboard
```

## Usage

```js
var winClipboard = require('win-clipboard');

winClipboard('Rainbow');
```

## Why?

I needed to put some fancy stuff into a clipboard, and I was surprised that there's no good library for managing the clipboard.

What I needed was an ability to set HTML / RTF / plain text together, which was nowhere to be found.

Other requirement that I had in other side project, was retrieve all the formats in clipboard, for a further inspection.

All the implementation allowed just for setting a plaintext - it was due to the fact that it was based on `clip` bin.

## License

MIT © [Marek Lewandowski]()


[npm-image]: https://badge.fury.io/js/win-clipboard.svg
[npm-url]: https://npmjs.org/package/win-clipboard
[travis-image]: https://travis-ci.org/mlewand/win-clipboard.svg?branch=master
[travis-url]: https://travis-ci.org/mlewand/win-clipboard
[daviddm-image]: https://david-dm.org/mlewand/win-clipboard.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mlewand/win-clipboard
