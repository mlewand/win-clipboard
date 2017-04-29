'use strict';

const winClipboard = require( '../lib' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'win-clipboard', function() {
	const FORMATS = {
		TEXT: 'CF_TEXT',
		CUSTOM: 'win-clipboard-test'
	};

	describe( 'setData', () => {
		const initialTextData = winClipboard.getData( FORMATS.TEXT );

		after( () => {
			// Restore original data in the clipboard once suite is done.
			winClipboard.setData( FORMATS.TEXT, ( new Int8Array( initialTextData ) ).buffer );
		} );

		it( 'works with builtin format', function() {
			let randomString = 'Random text ' + Math.random() + '\0',
				randomStringView = new Int8Array( Array.from( randomString ) );

			winClipboard.setData( FORMATS.TEXT, randomStringView.buffer );

			expect( winClipboard.getData( FORMATS.TEXT ) ).to.be.deep.equal( Buffer.from( randomStringView ) );
		} );

		it( 'returns number of bytes written', function() {
			let bytesView = new Int8Array( [ 1, 1, 1 ] ),
				ret = winClipboard.setData( FORMATS.TEXT, bytesView.buffer );

			expect( ret ).to.be.eql( 3 );
		} );

		it( 'works with custom format', function() {
			let randomString = 'Random text ' + Math.random() + '\0',
				randomStringView = new Int8Array( Array.from( randomString ) );

			winClipboard.setData( FORMATS.CUSTOM, randomStringView.buffer );

			expect( winClipboard.getData( FORMATS.CUSTOM ) ).to.be.deep.equal( Buffer.from( randomStringView ) );
		} );
	} );
} );
