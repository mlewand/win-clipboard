// hello.cc
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

void HelloMethod(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}

void GetUser(const FunctionCallbackInfo<Value> &args)
{
	BOOL res = false;
    Isolate *isolate = args.GetIsolate();
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, "Andrzej"));
}

void init(Local<Object> exports)
{
    NODE_SET_METHOD(exports, "hello", HelloMethod);
    NODE_SET_METHOD(exports, "getUser", GetUser);
}

NODE_MODULE(addon, init)

} // namespace demo