'use strict';

const addon = require( 'bindings' )( 'addon' ),
	iconv = require( 'iconv-lite' );


module.exports = {
	getText: function( format, forceAscii ) {
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
			const decoder = new StringDecoder( 'utf-16le' );

			ret = decoder.write( bytes );
		}

		// Windows keeps tailing NULL byte for strings.
		/* istanbul ignore else */
		if ( ret[ ret.length - 1 ] == '\0' ) {
			ret = ret.substr( 0, ret.length - 1 );
		}

		return ret;
	},

	setText: function( text, format ) {
		format = format || 'CF_UNICODETEXT';

		let targetEncoding = format == 'CF_TEXT' ? 'ascii' : 'utf-16le',
			buffer = iconv.encode( text + '\0', targetEncoding ),
			stringView = new Int8Array( buffer );

		return this.setData( stringView.buffer, format );
	},

	getData: addon.getData,
	setData: addon.setData,
	clear: addon.clear,
	getFormats: addon.getFormats
};