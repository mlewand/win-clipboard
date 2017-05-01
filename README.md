# win-clipboard [![NPM version][npm-image]][npm-url] [![Build Status][appveyor-image]][appveyor-url] [![Dependency Status][daviddm-image]][daviddm-url]

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
const clipboard = require( 'win-clipboard' );

clipboard.getText(); // Returns unicode format as a string.

clipboard.getHTML(); // Returns HTML as a string.

clipboard.getData( 'HTML Format' ); // Returns raw content of a "HTML Format".

clipboard.setText( '🙀🙊' ); // Sets some fancy emoji in your unicode format.

clipboard.getFormats(); // Lists formats in the clipboard.
```

## API

* `getText( [format, forceAscii] )`
  * Params:
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc. Defaults to `CF_UNICODETEXT`.
    * `forceAscii` - `boolean` - Whether ASCII encoding should be used? By default module will attempt to decode UTF-16 to UTF-8. Defaults to `false`.
  * Returns:
    * `string` - String retrieved from the clipboard.
    * `null` - If no data was found.
* `setText( newText[, format] )`
  * Params:
    * `newText` - `string` - Text to be set in the clipboard.
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc. Defaults to `CF_UNICODETEXT`.
  * Returns:
    * `number` - Number of bytes written if successful.
    * `null` - If failed.
* `getHTML( [fullHtml, format] )`
  * Params:
    * `fullHtml` - `boolean` - If set to `true` will return outer context, like `html`, `body` tags. Defaults to `false`.
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc.
* `setHTML( newHtml, [sourceUrl, format] )`
  * Params:
    * `newHtml` - `string` - HTML code to be set.
    * `sourceUrl` - `string` - URL to be set as a SourceURL header. Defaults to `null`.
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc.
* `getData( format )`
  * Params:
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc.
  * Returns:
    * [`Buffer`](https://nodejs.org/api/buffer.html) - A raw buffer of what is kept in the memory.
    * `null` - If nothing is found.
* `setData( newData, format )` - Sets raw data to a given clipboard format.
  * Params:
    * `newData` - [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) - Raw data to be set.
    * `format` - `string` - Format name you want to set. Could be one of the [standard builtins](https://msdn.microsoft.com/pl-pl/library/windows/desktop/ff729168(v=vs.85).aspx). Examples are `CF_UNICODETEXT`, `CF_TEXT`, `HTML Format` etc.
  * Returns:
    * `number` - Number of bytes written if successful.
    * `null` - If failed.
* `getFormats`
  * Returns:
    * `string[]` - An array of strings with available formats.
* `clear` - Simply wipes out your clipboard.

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
[appveyor-image]: https://ci.appveyor.com/api/projects/status/sbvv75y2edldsktq?svg=true&passingText=master%20%E2%9C%93
[appveyor-url]: https://ci.appveyor.com/project/mlewand/win-clipboard
[daviddm-image]: https://david-dm.org/mlewand/win-clipboard.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mlewand/win-clipboard
