const app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        avatar: '/images/default.png',
        name: '人脉名片王',
        id: null,
        company_number: '0535-6389615',
        internal: false,
        version: ''
    },
    onLoad: function(options) {

    },
    onShow: function() {
        this.setData({
            version: app.globalData.version
        })
        if (app.globalData.access_token && app.globalData.userid != null) {
            this.getData()
        }else{
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
    getData(){
        util.getData('users/' + app.globalData.userid, {}, res => {
            if(res.statusCode == 403){
                util.reLogin(res=>{
                    this.getData()
                })
            }
            app.globalData.internal = res.data.data.internal
            this.setData({
                id: app.globalData.userid,
                internal: res.data.data.internal
            })
        })
    },
    toCardList: function() {
        wx.navigateTo({
            url: '/pages/collection/collection'
        })
    },
    toFriend: function() {
        wx.navigateTo({
            url: '/pages/user/user'
        })
    },
    setting: function() {
        wx.openSetting({
            success: (res) => {}
        })
    },
    statis: function() {
        wx.navigateTo({
            url: '/pages/statis/statis'
        })
    },
    call_company() {
        wx.makePhoneCall({
            phoneNumber: this.data.company_number
        })
        wx.reportAnalytics('click_bottom', {
            number: 1
        })
    },
    addWx() {
        wx.setClipboardData({
            data: 'zhongwei',
            success: function(res) {
                wx.showToast({
                    title: '已复制微信号',
                    icon: 'success',
                    duration: 1500
                })
            }
        })
    }
})