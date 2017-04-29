'use strict';

const html = require( '../lib/html' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'html helper', function() {
	describe( 'encode', () => {
		it( 'Plays well with \r\n eols', () => {
			const expectedFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000162\r\nEndFragment:00000263\r\nSourceURL:https://www.w3.org/\r\n<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';
			const inputFixture = '<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );
		} );

		it( 'Automatically inserts markers', () => {
			const expectedFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000160\r\nEndFragment:00000265\r\nSourceURL:https://www.w3.org/\r\n<html><body><!--StartFragment-->\r\nThe TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n<!--EndFragment--></body>\r\n</html>';
			const inputFixture = '<html><body>\r\nThe TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n</body>\r\n</html>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );
		} );

		it( 'Generates markers also for hopeless HTML', () => {
			const expectedFixture = 'Version:0.9\nStartHTML:00000122\nEndHTML:00000177\nStartFragment:00000142\nEndFragment:00000159\nSourceURL:https://www.w3.org/\n<!--StartFragment-->foo<b>bar\nbaz</b><!--EndFragment-->';
			const inputFixture = 'foo<b>bar\nbaz</b>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );
		} );
	} );

	describe( 'decode', () => {
		it( 'works parses content with markers', () => {
			const inputFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000160\r\nEndFragment:00000265\r\nSourceURL:https://www.w3.org/\r\n<html><body><!--StartFragment-->\r\nThe TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n<!--EndFragment--></body>\r\n</html>';

			let ret = html.decode( inputFixture );

			expect( ret ).to.be.eql( '\r\nThe TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span>\r\n' );
		} );

		it( 'returns correct val for empty input', () => {
			expect( html.decode( '' ) ).to.be.eql( null );
		} );
	} );
} );