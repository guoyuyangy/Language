const app = getApp()
var util = require('../../utils/util.js');
var $loading
Page({
    data: {
        wallet: [],
        id: null,
        name: null,
        avatar: null
    },
    onLoad: function(options) {
        $loading = this.selectComponent(".J_loading")
        $loading.show()
    },
    onShow: function() {
        if (app.globalData.access_token) {
            this.getData()
        } else {
            wx.login({
                success: res => {
                    if (res.code) {
                        //发起网络请求
                        wx.request({
                            url: `${app.globalData.host}/api/auth/login`,
                            method: 'POST',
                            data: {
                                code: res.code
                            },
                            success: res => {
                                app.globalData.access_token = res.data.data.access_token
                                app.globalData.userid = res.data.data.user_id
                                wx.setStorageSync('access_token', res.data.data.access_token)
                                this.getData()
                            }
                        })
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg)
                    }
                }
            })
        }
    },
    getData() {
        util.getData('user/wallet', {}, res => {
            if(res.statusCode == 403){
                util.reLogin(res=>{
                    this.getData()
                })
            }
            this.setData({
                wallet: res.data.data,
                id: app.globalData.userid,
            })
            wx.hideLoading()
            $loading.hide()
        })
    }
})