const app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        avatar: '/images/default.png',
        name: '人脉名片王',
        id: null,
        company_number: '0535-6389615',
        internal: false
    },
    onLoad: function(options) {

    },
    onShow: function() {
        util.getData('users/' + app.globalData.userid, {}, res => {
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
    },
})