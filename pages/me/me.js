const app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        avatar: '/images/default.png',
        name: '人脉名片王',
        id: null,
        company_number: '0535-6389615'
    },
    onLoad: function(options) {
        
    },
    onShow: function() {
        this.setData({
            id: app.globalData.userid
        })
    },
    toCardList: function() {
        wx.navigateTo({
          url: '/pages/collection/collection'
        })
    },
    toFriend: function() {
        wx.navigateTo({
          url: '/pages/edit/edit?type=other'
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