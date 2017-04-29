'use strict';

const html = require( '../lib/html' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'html helper', function() {
	describe( 'encode', () => {
		it( 'plays well with \r\n eols', () => {
			// This is kind of a fake fixture as it uses "<spance>\n" character to emulate "\r\n".
			const expectedFixture = 'Version:0.9\r\nStartHTML:00000128\r\nEndHTML:00000299\r\nStartFragment:00000162\r\nEndFragment:00000263\r\nSourceURL:https://www.w3.org/\r\n<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';
			const inputFixture = '<html><body>\r\n<!--StartFragment-->The TurinSir Timâ€™s <span class="dtstart published" title="2017-04-18T17:50:34Z">8 April 2017</span><!--EndFragment-->\r\n</body>\r\n</html>';

			let ret = html.encode( inputFixture, 'https://www.w3.org/' );

			expect( ret ).to.be.eql( expectedFixture );

		} );
	} );
} );