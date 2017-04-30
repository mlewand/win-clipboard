'use strict';

const addon = require( 'bindings' )( 'addon' ),
	iconv = require( 'iconv-lite' ),
	html = require( './html' );


module.exports = {
	getText: function( format, forceAscii, encoding ) {
		format = format || 'CF_UNICODETEXT';

		let bytes = this.getData( format ),
			ret;

		if ( !bytes ) {
			return bytes;
		}

		if ( format === 'CF_TEXT' || forceAscii ) {
			ret = '';

			for ( let i = 0; i < bytes.length; i++ ) {
				ret += String.fromCharCode( bytes[ i ] );
			}
		} else {
			const StringDecoder = require( 'string_decoder' ).StringDecoder;
			const decoder = new StringDecoder( encoding || 'utf-16le' );

			ret = decoder.write( bytes );
		}

		// Windows keeps tailing NULL byte for strings.
		/* istanbul ignore else */
		if ( ret[ ret.length - 1 ] == '\0' ) {
			ret = ret.substr( 0, ret.length - 1 );
		}

		return ret;
	},

	setText: function( text, format, encoding ) {
		format = format || 'CF_UNICODETEXT';

		if ( !encoding && format === 'CF_TEXT' ) {
			encoding = 'ascii';
		}

		let buffer = iconv.encode( text + '\0', encoding || 'utf-16le' ),
			stringView = new Int8Array( buffer );

		return this.setData( stringView.buffer, format );
	},

	getHtml: function( format ) {
		return html.decode( this.getText( format || 'HTML Format', null, 'utf8' ) );
	},

	setHtml: function( newHtml, sourceUrl, format ) {
		return this.setText( html.encode( newHtml, sourceUrl ), format || 'HTML Format', 'utf8' );
	},

	getData: addon.getData,
	setData: addon.setData,
	clear: addon.clear,
	getFormats: addon.getFormats
};