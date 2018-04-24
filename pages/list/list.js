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
    add: function() {
        wx.navigateTo({
            url: '/pages/edit/edit?type=add'
        })
    },
    change: function() {
        console.log('我选择这张！！！')
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