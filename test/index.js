'use strict';

const winClipboard = require( '../lib' );
const chai = require( 'chai' );
const expect = chai.expect;
const clipboardy = require( 'clipboardy' );

describe( 'win-clipboard', function() {
	const FORMATS = {
		TEXT: 'CF_TEXT',
		UNICODE: 'CF_UNICODETEXT',
		CUSTOM: 'win-clipboard-test'
	};

	describe( 'getData', () => {
		it( 'Works', () => {
			return clipboardy.write( 'foo1' )
				.then( () => {
					expect( winClipboard.getData( FORMATS.TEXT ) ).to.be.deep.equal( Buffer.from( 'foo1\0' ) );
				} );
		} );

		it( 'Returns a proper val for nonexisting entires', () => {
			expect( winClipboard.getData( 'some-funny-formaaat-name11' ) ).to.be.equal( null );
		} );
	} );

	describe( 'setData', () => {
		const initialTextData = winClipboard.getData( FORMATS.TEXT );

		after( () => {
			// Restore original data in the clipboard once suite is done.
			winClipboard.setData( FORMATS.TEXT, ( new Int8Array( initialTextData ) ).buffer );
		} );

		it( 'Works with builtin format', function() {
			let randomString = 'Random text ' + Math.random() + '\0',
				randomStringView = new Int8Array( Array.from( randomString ) );

			winClipboard.setData( FORMATS.TEXT, randomStringView.buffer );

			expect( winClipboard.getData( FORMATS.TEXT ) ).to.be.deep.equal( Buffer.from( randomStringView ) );
		} );

		it( 'Returns number of bytes written', function() {
			let bytesView = new Int8Array( [ 1, 1, 1 ] ),
				ret = winClipboard.setData( FORMATS.TEXT, bytesView.buffer );

			expect( ret ).to.be.eql( 3 );
		} );

		it( 'Works with custom format', function() {
			let randomString = 'Random text ' + Math.random() + '\0',
				randomStringView = new Int8Array( Array.from( randomString ) );

			winClipboard.setData( FORMATS.CUSTOM, randomStringView.buffer );

			expect( winClipboard.getData( FORMATS.CUSTOM ) ).to.be.deep.equal( Buffer.from( randomStringView ) );
		} );
	} );

	describe( 'getText', () => {
		it( 'Works well with UTF-8', () => {
			const utfString = 'Foo ¥£€ûл身śĆ🙀🙊';
			return clipboardy.write( utfString )
				.then( () => {
					expect( winClipboard.getText( FORMATS.UNICODE ) ).to.be.eql( utfString );
				} );
		} );

		it( 'Works with plain text', () => {
			const simpleText = 'ab\ncd';

			return clipboardy.write( simpleText )
				.then( () => {
					expect( winClipboard.getText( FORMATS.TEXT ) ).to.be.eql( simpleText );
				} );
		} );
	} );
} );
