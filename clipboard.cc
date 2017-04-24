#include <node.h>
#include <Windows.h>

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

void init(Local<Object> exports)
{
    NODE_SET_METHOD(exports, "getUser", GetUser);
}

NODE_MODULE(addon, init)

} // namespace demo