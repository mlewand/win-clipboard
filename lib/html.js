'use strict';

const detectNewline = require( 'detect-newline' );

module.exports = {
	/**
	 * Puts given HTML into a clipboard. It takes care of generating required
	 * [Microsoft HTML Clipboard Format](https://msdn.microsoft.com/en-us/library/windows/desktop/ms649015(v=vs.85).aspx).
	 *
	 * @param {string} str - HTML to be placed in the clipboard.
	 * @param {string} sourceUrl - Should include a full URL, e.g. `https://github.com/mlewand/win-clipboard/`.
	 */
	encode( str, sourceUrl ) {
		const eol = detectNewline.graceful( str );

		let headers = [
			'Version:0.9',
			'StartHTML:00000000',
			'EndHTML:00000000',
			'StartFragment:00000000',
			'EndFragment:00000000'
		];

		if ( sourceUrl ) {
			headers.push( 'SourceURL:' + sourceUrl );
		}

		// html and body elements should be added if missing (#13).
		str = this._ensureElementExists( 'body', str );
		str = this._ensureElementExists( 'html', str );

		str = this._calculateHeaders( headers, str, eol );

		headers.push( str );

		return headers.join( eol );
	},

	/**
	 * Decodes Microsoft HTML format.
	 *
	 * @param {string} str Content in the clipboard, including headers.
	 * @param {Boolean} [wholeHtml] If `true` whole HTML including `html`, `body` and `<!--StartFragment-->` elements.
	 * @returns {string}
	 */
	decode( str, wholeHtml ) {
		if ( !str ) {
			return null;
		}

		let startFrag = ( /StartFragment:\s*0+(\d+?)$/mg ).exec( str ),
			endFrag = ( /EndFragment:\s*0+(\d+?)$/mg ).exec( str );

		if ( wholeHtml ) {
			startFrag = ( /StartHTML:\s*0+(\d+?)$/mg ).exec( str );
			endFrag = ( /EndHTML:\s*0+(\d+?)$/mg ).exec( str );
		}

		startFrag = Number( startFrag[ 1 ] );
		endFrag = Number( endFrag[ 1 ] );

		return str.slice( startFrag, endFrag );
	},

	_calculateHeaders( headers, str, eol ) {
		// This function encapsulates all the junk related tu updating header positions.
		// It might also change the string, so it returns it.
		const headerSize = headers.join( eol ).length + eol.length;

		function overwriteString( str, number ) {
			number = String( number );
			return str.substr( 0, str.length - number.length ) + number;
		}

		// StartFragment
		let startFragRegexp = /<!--\s*StartFragment\s*-->/gm;
		let startFragmentPos = startFragRegexp.exec( str );

		if ( startFragmentPos ) {
			startFragmentPos = startFragmentPos.index + startFragmentPos[ 0 ].length;
		} else {
			let bodyStartPosition = /<body.*?>/.exec( str ) || {
				index: 0,
				[ 0 ]: ''
			};

			bodyStartPosition = bodyStartPosition.index + bodyStartPosition[ 0 ].length;
			str = str.slice( 0, bodyStartPosition ) + '<!--StartFragment-->' + str.slice( bodyStartPosition );
			startFragmentPos = bodyStartPosition + 20;
		}

		headers[ 3 ] = overwriteString( headers[ 3 ], headerSize + startFragmentPos );

		// EndFragment
		let endFragRegexp = /<!--\s*EndFragment\s*-->/gm;
		let endFragmentPos = endFragRegexp.exec( str );

		if ( endFragmentPos ) {
			endFragmentPos = endFragmentPos.index;
		} else {
			let bodyEndPosition = /<\/body.*?>/.exec( str ) || { index: str.length };

			bodyEndPosition = bodyEndPosition.index;
			str = str.slice( 0, bodyEndPosition ) + '<!--EndFragment-->' + str.slice( bodyEndPosition );
			endFragmentPos = bodyEndPosition;
		}

		headers[ 4 ] = overwriteString( headers[ 4 ], headerSize + endFragmentPos );

		// StartHTML
		headers[ 1 ] = overwriteString( headers[ 1 ], headerSize );
		// EndHTML
		headers[ 2 ] = overwriteString( headers[ 2 ], headerSize + str.length );

		return str;
	},

	/**
	 * Ensures that `string` is wrapped with an `tagName` element.
	 *
	 * @param {string} tagName
	 * @param {string} inputString
	 * @returns {string} A copy of `inputString` that is guaranteed to be wrapped with `tagName` element.
	 */
	_ensureElementExists: function( tagName, inputString ) {
		let ret = inputString;

		if ( ret.indexOf( '<' + tagName ) === -1 ) {
			ret = `<${tagName}>${ret}`;
		}

		if ( ret.indexOf( '</' + tagName + '>' ) === -1 ) {
			ret = `${ret}</${tagName}>`;
		}

		return ret;
	}
};