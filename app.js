import { is_dev, dev_host, production_host } from 'env.js'
App({
    onLaunch: function() {
        wx.clearStorageSync()
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        this.globalData.access_token = wx.getStorageSync('access_token');
    },

    onShow: function() {
        if (!this.globalData.access_token) {
            console.log("No access token found, try to login!");
            this.login();
        }
    },
    login: function() {
        wx.login({ 
            success: res => {
                if (res.code) {
                    //发起网络请求
                    wx.request({
                        url: `${this.globalData.host}/api/auth/login`,
                        method: 'POST',
                        data: {
                            code: res.code
                        },
                        success: res => {
                            this.globalData.userid = res.data.data.user_id
                            this.globalData.access_token = res.data.data.access_token;
                            wx.setStorageSync('access_token', res.data.data.access_token)
                            if (getCurrentPages().length != 0) {
                                getCurrentPages()[getCurrentPages().length - 1].onShow()
                            }
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            }
        });
    },

    globalData: {
        access_token: null,
        user_info: null,
        session_id: null,
        userid: null,
        avatar: null,
        name: null,
        internal:null,
        host: is_dev() ? dev_host() : production_host(),
        version: 'v1.0.0',
    }
})