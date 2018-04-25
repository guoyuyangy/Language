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
        wx.showLoading({
            title: '加载中',
        })
    },
    onShow: function() {
        if (app.globalData.access_token) {
            util.getData('user/wallet', {}, res => {
                this.setData({
                    wallet: res.data.data,
                    id: app.globalData.userid
                })
                wx.hideLoading()
            })
        }
    }
})