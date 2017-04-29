'use strict';

const addon = require( 'bindings' )( 'addon' );


module.exports = {
	getText: function( format, forceAnsii ) {
		format = format || 'CF_UNICODETEXT';

		let bytes = this.getData( format ),
			ret;

		if ( !bytes ) {
			return bytes;
		}

		if ( format === 'CF_TEXT' || forceAnsii ) {
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
		if ( ret[ ret.length - 1 ] == '\0' ) {
			ret = ret.substr( 0, ret.length - 1 );
		}

		return ret;
	},
	getData: addon.getData,
	setData: addon.setData,
	clear: addon.clear,
	getFormats: addon.getFormats
};
