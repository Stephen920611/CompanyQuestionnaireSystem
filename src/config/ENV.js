/**
 * @description
 * @Version Created by Stephen on 2019/8/14.
 * @Author Stephen
 * @license dongfangdianzi
 */

window.ENV = (function () {
    let rootPath = '/pw/';     // 路由的根路径
    let apiDomain = "http://49.232.51.60:9100/api"; //最后提供的正式api接口（打包用）
    // let apiDomain = "http://192.168.2.100:8086/api"; //测试api接口
    // let apiDomain = "http://61.156.14.61:10007/api"; //线上api接口

    return {
        apiDomain: apiDomain,         // api请求接口   测试服务器
        rootPath: rootPath,                       	// 路由的根路径
        apiSuccessCode: 0,                          // API接口响应成功的code
        width: 1920,
        height: 1080,
        isAntdProRequest: false,        //是否是antd pro原来的请求方式，true需要加上api

        login: {
            loginInfoKey : "__login_info__",
            errorCode: 900,                                 // 未登录的error code
            isCheckLogin: true,                            // web端是否验证登录
            cookieKey: '__login_solution_user_info__',               // 登录成功的cookie key, 用于验证当前页面是否登录
            defaultRedirectUrl: rootPath + 'overview/list',  // 登录成功默认重定向的url
            loginUrl: rootPath + 'login',                   // 登录页面url

            // 不需要验证是否登录的路由配置
            noCheckIsLoginRoutes: [
                rootPath + 'login',
            ],
        },

        mock: {
            apiDomain: 'http://localhost:8180',     // mockApi请求接口
            isStart: false,                         // 是否开启mock
        },
        logoTitle: '国家信息中心',                // logo标题文字
        isShowLogoIcon: false,                      // 是否显示logo图标
        isShowLoginCopy: false,
    };
})();
