
const clipboard = require( '../build/Release/addon' );
const StringDecoder = require( 'string_decoder' ).StringDecoder;
const decoder = new StringDecoder( 'utf8' );


// -------- getFormats()


console.log( 'available formats', clipboard.getFormats() );

// ------- getData -----------

let textData = clipboard.getData( 'CF_UNICODETEXT' );
// let textData = clipboard.getData( 'CF_TEXT' );

console.log( 'text data text:', textData );
console.log( 'decoded:', decoder.write( textData ) );
console.log( 'length', textData.length );
console.log( 'first char', textData[ 0 ] );


console.log( 'text data html:', clipboard.getData( 'HTML Format' ) );

