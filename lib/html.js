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

		function overwriteString( str, number ) {
			number = String( number );
			return str.substr( 0, str.length - number.length ) + number;
		}

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

		const headerSize = headers.join( eol ).length + eol.length;

		// StartHTML
		headers[ 1 ] = overwriteString( headers[ 1 ], headerSize );
		// EndHTML
		headers[ 2 ] = overwriteString( headers[ 2 ], headerSize + str.length );

		// StartFragment
		let startFragRegexp = /<!--\s*StartFragment\s*-->/gm;
		let startFragmentPos = startFragRegexp.exec( str );

		if ( startFragmentPos ) {
			startFragmentPos = startFragmentPos.index + startFragmentPos[ 0 ].length;
		} else {
			// For now...
			startFragmentPos = 0;
		}

		headers[ 3 ] = overwriteString( headers[ 3 ], headerSize + startFragmentPos );

		// EndFragment
		let endFragRegexp = /<!--\s*EndFragment\s*-->/gm;
		let endFragmentPos = endFragRegexp.exec( str );

		if ( endFragmentPos ) {
			endFragmentPos = endFragmentPos.index;
		} else {
			// For now...
			endFragmentPos = str.length;
		}

		headers[ 4 ] = overwriteString( headers[ 4 ], headerSize + endFragmentPos );

		headers.push( str );

		return headers.join( eol );
	},
	decode() {}
};