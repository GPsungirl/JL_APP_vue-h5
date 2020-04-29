
// 这里根据移动端原生的 userAgent 来判断当前是 Android 还是 ios
const u = navigator.userAgent;
// Android终端
const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
// IOS 终端
const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); 

/**
 * 配合 IOS 使用时的初始化方法
 */
const iosFunction = (callback) => {
    if (window.WebViewJavascriptBridge) { return callback(window.WebViewJavascriptBridge) }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback) }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function(){
         document.documentElement.removeChild(WVJBIframe);
    }, 0);
}

/**
 * 配合 Android 使用时的初始化方法
 */
const androidFunction = (callback) => {
    if (window.WebViewJavascriptBridge) {
        callback(window.WebViewJavascriptBridge);
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function () {
            callback(window.WebViewJavascriptBridge);
        }, false)
    }
}

window.setupWebViewJavascriptBridge = isAndroid ? androidFunction : iosFunction;

isAndroid && window.setupWebViewJavascriptBridge(function (bridge) {
    // 注册 H5 界面的默认接收函数（与安卓交互时，安卓端可以不调用函数名，直接 send 数据过来，就能够在这里接收到数据）
    bridge.init(function (msg, responseCallback) {
        console.log(msg);
        responseCallback("JS 返回给原生的消息内容");
    })
});



//  注册与原生交互的事件函数

/*
    window.setupWebViewJavascriptBridge(bridge => {
        bridge.registerHandler('事件函数名',fun 执行函数);
    })
*/
window.setupWebViewJavascriptBridge(bridge => {
    /**
     * data：原生传过来的数据
     * fn: 原生传过来的回调函数
     */
    bridge.registerHandler("H5Function", (data, fn) => {
        console.log(data);
        fn && fn();
    });
});

// 调用原生注册的事件函数
/*
    window.setupWebViewJavascriptBridge(bridge => {
        bridge.callHandler('安卓端函数名', "传给原生端的数据", callback 回调函数);
    })
*/
window.setupWebViewJavascriptBridge(bridge => {
    bridge.callHandler('changeData', data, (result) => {
        console.log(result);
    });
})


