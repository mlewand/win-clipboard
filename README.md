# win-clipboard [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

An experimental Node.js module that provides you a full control over host clipboard in Windows environment.

## Installation

If you haven't ever messed up with C++ addons, you'll have most likely to install `windows-build-tools`. It takes a fair amount of time to complete, but simplifies the installation by **a lot**.

```sh
npm install --global --production windows-build-tools
```

Once you have the above, it's as simple as:

```sh
npm install --save win-clipboard
```

## Usage

```js
var winClipboard = require('win-clipboard');

winClipboard('Rainbow');
```

## API

* `setData( format, newData )` - Sets raw data to a given clipboard format.
  * Params:
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc.
    * `newData` - [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) - Raw data to be set.
  * Returns:
    * `number` - Number of bytes written if successful.
    * `null` - If failed.
* `getData( format )`
  * Params:
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc.
  * Returns:
    * [`Buffer`](https://nodejs.org/api/buffer.html) - A raw buffer of what is kept in the memory.
    * `null` - If nothing is found.
* `getData( [format, forceAnsii] )`
  * Params:
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc. Defaults to `CF_UNICODETEXT`.
  * Returns:
    * `string` - String retrieved from the clipboard.
    * `null` - If no data was found.

## Why?

I needed to put some fancy stuff into a clipboard, and I was surprised that there's no good library for managing the clipboard.

What I needed was an ability to set HTML / RTF / plain text together, which was nowhere to be found.

Other requirement that I had in other side project, was retrieve all the formats in clipboard, for a further inspection.

All the implementation allowed just for setting a plaintext - it was due to the fact that it was based on `clip` bin.

## How?

I implemented it using a Node.js C++ addon, which uses WinAPI.

The implementation turned out to be extremely easy, while having access to the WinAPI it gives all the power in the world to work with the clipboard.

## License

MIT © [Marek Lewandowski]()


[npm-image]: https://badge.fury.io/js/win-clipboard.svg
[npm-url]: https://npmjs.org/package/win-clipboard
[travis-image]: https://travis-ci.org/mlewand/win-clipboard.svg?branch=master
[travis-url]: https://travis-ci.org/mlewand/win-clipboard
[daviddm-image]: https://david-dm.org/mlewand/win-clipboard.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mlewand/win-clipboard
