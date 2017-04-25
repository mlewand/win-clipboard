#include <node.h>
#include <Windows.h>
#include <map>

namespace demo
{

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Boolean;

// A quick and dirty method to convert UTF16 to UTF8 - http://stackoverflow.com/questions/215963/how-do-you-properly-use-widechartomultibyte
// Convert a wide Unicode string to an UTF8 string
std::string utf8_encode(const std::wstring &wstr)
{
    if( wstr.empty() ) return std::string();
    int size_needed = WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), NULL, 0, NULL, NULL);
    std::string strTo( size_needed, 0 );
    WideCharToMultiByte(CP_UTF8, 0, &wstr[0], (int)wstr.size(), &strTo[0], size_needed, NULL, NULL);
    return strTo;
}

void GetUser(const FunctionCallbackInfo<Value> &args)
{
	const unsigned int BUFFER_SIZE = 255;
	DWORD userNameLength = BUFFER_SIZE - 1;
	BOOL res = false;
	wchar_t userName[ BUFFER_SIZE ];
	memset( userName, 0, sizeof( WCHAR ) * userNameLength );

	res = GetUserNameW( userName, &userNameLength );

    Isolate *isolate = args.GetIsolate();

	if ( res ) {
		args.GetReturnValue().Set(String::NewFromUtf8(isolate, utf8_encode( userName ).c_str()));
	} else {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
	}
}

void ClearClipboard( const FunctionCallbackInfo<Value> &args ) {
	BOOL ret = true;

	if ( !OpenClipboard( NULL ) ) {
		ret = false;
	}

	EmptyClipboard();
	CloseClipboard();

	Isolate *isolate = args.GetIsolate();
	args.GetReturnValue().Set(Boolean::New(isolate, ret));
}

void GetClipboardFormats( const FunctionCallbackInfo<Value> &args ) {
	Isolate *isolate = args.GetIsolate();
	Local<v8::Array> arr = v8::Array::New( isolate );

	int formatsCount = CountClipboardFormats();
	BOOL clipboardReady = false;
	const int BUFFER_LENGTH = 255;

	std::vector<UINT> types( formatsCount );

	if ( !formatsCount ) {
		// Early return, there's no need to open clipboard and do all this jazz.
		return;
	}

	clipboardReady = OpenClipboard( NULL );

	if ( !clipboardReady ) {
		return;
	}

	std::map<int,PTCHAR> standardFormats;
	standardFormats[ 2 ] = TEXT( "CF_BITMAP" );
	standardFormats[ 8 ] = TEXT( "CF_DIB" );
	standardFormats[ 17 ] = TEXT( "CF_DIBV5" );
	standardFormats[ 5 ] = TEXT( "CF_DIF" );
	standardFormats[ 0x0082 ] = TEXT( "CF_DSPBITMAP" );
	standardFormats[ 0x008E ] = TEXT( "CF_DSPENHMETAFILE" );
	standardFormats[ 0x0083 ] = TEXT( "CF_DSPMETAFILEPICT" );
	standardFormats[ 0x0081 ] = TEXT( "CF_DSPTEXT" );
	standardFormats[ 14 ] = TEXT( "CF_ENHMETAFILE" );
	standardFormats[ 0x0300 ] = TEXT( "CF_GDIOBJFIRST" );
	standardFormats[ 0x03FF ] = TEXT( "CF_GDIOBJLAST" );
	standardFormats[ 15 ] = TEXT( "CF_HDROP" );
	standardFormats[ 16 ] = TEXT( "CF_LOCALE" );
	standardFormats[ 3 ] = TEXT( "CF_METAFILEPICT" );
	standardFormats[ 7 ] = TEXT( "CF_OEMTEXT" );
	standardFormats[ 0x0080 ] = TEXT( "CF_OWNERDISPLAY" );
	standardFormats[ 9 ] = TEXT( "CF_PALETTE" );
	standardFormats[ 10 ] = TEXT( "CF_PENDATA" );
	standardFormats[ 0x0200 ] = TEXT( "CF_PRIVATEFIRST" );
	standardFormats[ 0x02FF ] = TEXT( "CF_PRIVATELAST" );
	standardFormats[ 11 ] = TEXT( "CF_RIFF" );
	standardFormats[ 4 ] = TEXT( "CF_SYLK" );
	standardFormats[ 1 ] = TEXT( "CF_TEXT" );
	standardFormats[ 6 ] = TEXT( "CF_TIFF" );
	standardFormats[ 13 ] = TEXT( "CF_UNICODETEXT" );
	standardFormats[ 12 ] = TEXT( "CF_WAVE" );

	for ( int i = 0; i < formatsCount; i++ ) {
		// For first iteration 0 needs to be passed, for any subsequent call a previous
		// id should be provided.
		types[ i ] = EnumClipboardFormats( i == 0 ? 0 : types[ i-1 ] );

		std::wstring out;

		// Check for predefined formats.
		if ( standardFormats.count( types[ i ] ) ) {
			out = std::wstring( standardFormats[ types[ i ] ] );
		} else {
			// Else pick it up from WINAPI.
			TCHAR curName[ BUFFER_LENGTH ];
			memset( curName, 0, sizeof( TCHAR ) * BUFFER_LENGTH );

			GetClipboardFormatName( types[ i ], curName, BUFFER_LENGTH - 1 );

			out = std::wstring( curName );
		}

		#ifdef UNICODE
			arr->Set( i, String::NewFromUtf8(isolate, utf8_encode( out ).c_str()) );
		#else
			arr->Set( i, String::NewFromOneByte( isolate, curName ) );
		#endif
	}

	args.GetReturnValue().Set( arr );

	CloseClipboard();
}

void init(Local<Object> exports)
{
    NODE_SET_METHOD(exports, "getUser", GetUser);
	NODE_SET_METHOD(exports, "clear", ClearClipboard);
	NODE_SET_METHOD(exports, "getFormats", GetClipboardFormats);
}

NODE_MODULE(addon, init)

} // namespace demo