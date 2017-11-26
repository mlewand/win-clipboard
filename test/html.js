'use strict';

const html = require( '../lib/html' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'html helper', function() {
	const expectedFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000162\r\n' +
		'EndFragment:00000263\r\nSourceURL:https://www.w3.org/\r\n<html><body>\r\n<!--StartFragment-->' +
		'The TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>' +
		'<!--EndFragment-->\r\n</body>\r\n</html>';

	describe( 'encode', () => {
		it( 'Plays well with \r\n eols', () => {
			const inputFixture = '<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" ' +
				'title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );
		} );


		it( 'Does not need sourceUrl', () => {
			const expectedFixture = 'Version:0.9\r\nStartHTML:00000097\r\nEndHTML:00000268\r\nStartFragment:00000131\r\n' +
				'EndFragment:00000232\r\n<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" ' +
				'title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';
			const inputFixture = '<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" ' +
				'title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';

			expect( html.encode( inputFixture ) ).to.be.eql( expectedFixture );
		} );

		it( 'Automatically inserts markers', () => {
			const expectedFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000160\r\n' +
				'EndFragment:00000265\r\nSourceURL:https://www.w3.org/\r\n<html><body><!--StartFragment-->\r\nThe TurinSir Timâ€™s' +
				' <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n<!--EndFragment--></body>\r\n</html>';
			const inputFixture = '<html><body>\r\nThe TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April ' +
				'2017</span>\r\n</body>\r\n</html>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );
		} );

		it( 'Generates markers also for hopeless HTML', () => {
			const expectedFixture = 'Version:0.9\nStartHTML:00000122\nEndHTML:00000203\nStartFragment:00000154\n' +
				'EndFragment:00000171\nSourceURL:https://www.w3.org/\n' +
				'<html><body><!--StartFragment-->foo<b>bar\nbaz</b><!--EndFragment--></body></html>';
			const inputFixture = 'foo<b>bar\nbaz</b>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );
		} );

		it( 'Generates html and body tags if not provided', () => {
			const expectedFixture = '<html><body>' +
				'<!--StartFragment-->ab<b>cd</b><!--EndFragment-->' +
				'</body></html>';
			const inputFixture = 'ab<b>cd</b>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			// Remove all the header part, as this assertion should not assesses this.
			ret = ret.replace( /^[\s\S]+SourceURL:.+\n/m, '' );

			expect( ret ).to.be.eql( expectedFixture );
		} );

		it( 'Does not interferer with existing body', () => {
			const expectedFixture = '<html><body><!--StartFragment-->' +
				'\naa\n' +
				'<!--EndFragment--></body></html>';
			const inputFixture = '<body>\naa\n</body>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			// Remove all the header part, as this assertion should not assesses this.
			ret = ret.replace( /^[\s\S]+SourceURL:.+\n/m, '' );

			expect( ret ).to.be.eql( expectedFixture );
		} );

		it( 'Recognizes html and body elements with attributes', () => {
			const expectedFixture = '<html data-foo><body class="a, b"><!--StartFragment-->' +
				'\naa\n' +
				'<!--EndFragment--></body></html>';
			const inputFixture = '<html data-foo><body class="a, b">\naa\n</body></html>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			// Remove all the header part, as this assertion should not assesses this.
			ret = ret.replace( /^[\s\S]+SourceURL:.+\n/m, '' );

			expect( ret ).to.be.eql( expectedFixture );
		} );
	} );

	describe( 'decode', () => {
		const inputFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000160\r\n' +
			'EndFragment:00000265\r\nSourceURL:https://www.w3.org/\r\n<html><body><!--StartFragment-->\r\nThe TurinSir Timâ€™s' +
			' <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n<!--EndFragment--></body>\r\n</html>';

		it( 'Works parses content with markers', () => {
			let ret = html.decode( inputFixture );

			expect( ret ).to.be.eql( '\r\nThe TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n' );
		} );

		it( 'returns correct val for empty input', () => {
			expect( html.decode( '' ) ).to.be.eql( null );
		} );

		it( 'Supports returning whole HTML', () => {
			const expected = '<html><body><!--StartFragment-->\r\nThe TurinSir Timâ€™s <span class="dtstart published" ' +
				'title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n<!--EndFragment--></body>\r\n</html>';
			expect( html.decode( inputFixture, true ) ).to.be.eql( expected );
		} );
	} );
} );