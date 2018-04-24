const app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        wallet: [],
        id: null,
        name: null,
        avatar: null
    },
    onLoad: function(options) {

    },
    onShow: function() {
        if (app.globalData.access_token) {
            util.getData('user/wallet', {}, res => {
                this.setData({
                    wallet: res.data.data,
                    id: app.globalData.userid
                })
            })
        }
    },
    onShareAppMessage: function() {
        return {
            title: app.globalData.name + '的名片',
            path: '/pages/index/index?id=' + this.data.id,
            success: function(res) {
                wx.showToast({
                    title: '转发成功',
                    icon: 'success',
                    duration: 800
                })
            }
        }
    }
})