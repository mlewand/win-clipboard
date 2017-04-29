
#include <nan.h>
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
using v8::Array;
using v8::Boolean;
using v8::Number;
using v8::Exception;

std::map<int,std::wstring> standardFormats;

void initFormats() {
	standardFormats[ 2 ] = std::wstring( L"CF_BITMAP" );
	standardFormats[ 8 ] = std::wstring( L"CF_DIB" );
	standardFormats[ 17 ] = std::wstring( L"CF_DIBV5" );
	standardFormats[ 5 ] = std::wstring( L"CF_DIF" );
	standardFormats[ 0x0082 ] = std::wstring( L"CF_DSPBITMAP" );
	standardFormats[ 0x008E ] = std::wstring( L"CF_DSPENHMETAFILE" );
	standardFormats[ 0x0083 ] = std::wstring( L"CF_DSPMETAFILEPICT" );
	standardFormats[ 0x0081 ] = std::wstring( L"CF_DSPTEXT" );
	standardFormats[ 14 ] = std::wstring( L"CF_ENHMETAFILE" );
	standardFormats[ 0x0300 ] = std::wstring( L"CF_GDIOBJFIRST" );
	standardFormats[ 0x03FF ] = std::wstring( L"CF_GDIOBJLAST" );
	standardFormats[ 15 ] = std::wstring( L"CF_HDROP" );
	standardFormats[ 16 ] = std::wstring( L"CF_LOCALE" );
	standardFormats[ 3 ] = std::wstring( L"CF_METAFILEPICT" );
	standardFormats[ 7 ] = std::wstring( L"CF_OEMTEXT" );
	standardFormats[ 0x0080 ] = std::wstring( L"CF_OWNERDISPLAY" );
	standardFormats[ 9 ] = std::wstring( L"CF_PALETTE" );
	standardFormats[ 10 ] = std::wstring( L"CF_PENDATA" );
	standardFormats[ 0x0200 ] = std::wstring( L"CF_PRIVATEFIRST" );
	standardFormats[ 0x02FF ] = std::wstring( L"CF_PRIVATELAST" );
	standardFormats[ 11 ] = std::wstring( L"CF_RIFF" );
	standardFormats[ 4 ] = std::wstring( L"CF_SYLK" );
	standardFormats[ 1 ] = std::wstring( L"CF_TEXT" );
	standardFormats[ 6 ] = std::wstring( L"CF_TIFF" );
	standardFormats[ 13 ] = std::wstring( L"CF_UNICODETEXT" );
	standardFormats[ 12 ] = std::wstring( L"CF_WAVE" );
}

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

// Convert an UTF8 string to a wide Unicode String
std::wstring utf8_decode(const std::string &str)
{
    if( str.empty() ) return std::wstring();
    int size_needed = MultiByteToWideChar(CP_UTF8, 0, &str[0], (int)str.size(), NULL, 0);
    std::wstring wstrTo( size_needed, 0 );
    MultiByteToWideChar                  (CP_UTF8, 0, &str[0], (int)str.size(), &wstrTo[0], size_needed);
    return wstrTo;
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
	Local<Array> arr = Array::New( isolate );

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

	for ( int i = 0; i < formatsCount; i++ ) {
		// For first iteration 0 needs to be passed, for any subsequent call a previous
		// id should be provided.
		types[ i ] = EnumClipboardFormats( i == 0 ? 0 : types[ i-1 ] );

		std::wstring out;

		// Check for predefined formats.
		if ( standardFormats.count( types[ i ] ) ) {
			out = standardFormats[ types[ i ] ];
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

// Looks for WinAPI format id, based on a given formatName.
UINT GetFormatId( const std::wstring &formatName ) {
	UINT formatId = 0;

	for (auto& item: standardFormats) {
		if ( item.second.compare( formatName ) == 0 ) {
			formatId = item.first;
		}
	}

	if ( formatId == 0 ) {
		int formatsCount = CountClipboardFormats();
		UINT lastClipboardFormat = 0;
		const UINT BUFFER_LENGTH = 256;
		std::vector<TCHAR> buffer( BUFFER_LENGTH, TEXT('\0') );

		for ( int i = 0; i < formatsCount && formatId == 0; i++ ) {
			// For first iteration 0 needs to be passed, for any subsequent call a previous
			// id should be provided.
			lastClipboardFormat = EnumClipboardFormats( lastClipboardFormat );

			// Check only for custom types, as predefined were already tested.
			if ( standardFormats.count( lastClipboardFormat ) == 0 ) {
				GetClipboardFormatName( lastClipboardFormat, &buffer[ 0 ], BUFFER_LENGTH );

				// Make sure it's null terminated.
				buffer[ BUFFER_LENGTH - 1 ] = TEXT('\0');

				// Compare...
				if ( formatName.compare( &buffer[ 0 ] ) == 0 ) {
					// Matched!
					formatId = lastClipboardFormat;
				}

				// Zero used buffer.
				memset( &buffer[ 0 ], TEXT('\0'), sizeof( TCHAR ) * BUFFER_LENGTH );
			}
		}
	}

	return formatId;
}

void GetData( const FunctionCallbackInfo<Value> &args ) {
	Isolate *isolate = args.GetIsolate();
	Local<v8::Object> ret;

	if ( args.Length() < 1 ) {
	    isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Missing argument 1")));
	    return;
	}

	if ( !args[0]->IsString() ) {
	    isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Argument 1 must be a string")));
	    return;
	}

	OpenClipboard( NULL );

	v8::String::Utf8Value formatRawName( args[ 0 ] );
	std::wstring formatNameUtf16 = utf8_decode( *formatRawName );

	UINT formatId = GetFormatId( formatNameUtf16 );

	if ( formatId != 0 ) {
		HGLOBAL clipboardDataHandle = GetClipboardData( formatId );

		if ( clipboardDataHandle != NULL ) {
			LPVOID data = GlobalLock( clipboardDataHandle );

			if ( data != NULL ) {
				SIZE_T clipboardBytes = GlobalSize( clipboardDataHandle );

				// It copies data, so no worry about WINAPI cleaning it up on it's own.
				ret = Nan::CopyBuffer( (const char*)data, clipboardBytes ).ToLocalChecked();

				GlobalUnlock( clipboardDataHandle );
			}
		}
	}

	CloseClipboard();

	if ( formatId != 0 ) {
		args.GetReturnValue().Set( ret );
	} else {
		// Format not found.
		args.GetReturnValue().Set( Nan::Null() );
	}
}

// Sets the clipboard data with a given format.
// Note that it does not clear the clipboard before, so that you can stack multiple different formats.
// You should clan it by yourself if you wish to.
void SetData( const FunctionCallbackInfo<Value> &args ) {
	Isolate *isolate = args.GetIsolate();
	const int minArgsCount = 2;

	if ( args.Length() < minArgsCount ) {
		char buffer[ 256 ];
		memset( buffer, 0, sizeof( char ) * 256 );
		sprintf( buffer, "Invalid arguments count. Expected %d but %d given.", minArgsCount, args.Length() );
	    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, buffer )));
	    return;
	}

	if ( !args[1]->IsString() ) {
	    isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Argument 2 must be a string")));
	    return;
	}

	if ( !args[0]->IsArrayBuffer() ) {
	    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Argument 1 must be an ArrayBuffer")));
	    return;
	}

	v8::Handle<v8::ArrayBuffer> newData = v8::Handle<v8::ArrayBuffer>::Cast( args[ 0 ] );
	size_t newDataBytes = newData->GetContents().ByteLength();

	v8::String::Utf8Value formatRawName( args[ 1 ] );
	std::wstring formatNameUtf16 = utf8_decode( *formatRawName );

	OpenClipboard( NULL );

	UINT formatId = GetFormatId( formatNameUtf16 );

	// Format id is not a known format.
	if ( formatId == 0 ) {
		formatId = RegisterClipboardFormat( formatNameUtf16.c_str() );
	}

	if ( formatId != 0 ) {
		// If valid fromat was given, do the magic and store the data.
		HGLOBAL allocHandle = GlobalAlloc( GMEM_MOVEABLE, newDataBytes );

		if ( allocHandle != NULL ) {
			LPVOID buffer = (LPVOID)GlobalLock( allocHandle );

			memcpy( buffer, newData->GetContents().Data(), newDataBytes );

			SetClipboardData( formatId, allocHandle );

			GlobalUnlock( allocHandle );
		}
	}

	CloseClipboard();

	if ( formatId != 0 ) {
		args.GetReturnValue().Set( Number::New( isolate, newDataBytes ) );
	} else {
		args.GetReturnValue().Set( Nan::Null() );
	}


	// args.GetReturnValue().Set( formatId != 0 ? ret : Nan::Null() );
}

void init(Local<Object> exports)
{
	initFormats();

    NODE_SET_METHOD(exports, "getUser", GetUser);
	NODE_SET_METHOD(exports, "clear", ClearClipboard);
	NODE_SET_METHOD(exports, "getFormats", GetClipboardFormats);
	NODE_SET_METHOD(exports, "getData", GetData);
	NODE_SET_METHOD(exports, "setData", SetData);
}

NODE_MODULE(addon, init)

} // namespace demo