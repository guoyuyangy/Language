var app = getApp()
var WxParse = require("../../wxParse/wxParse.js")
var util = require('../../utils/util.js');
Page({
    data: {
        product_id: null,
        userData: null,
        in_wallet: false,
        save: null,
        detailData: null,
        indicatorDots: false,
        autoplay: true,
        interval: 5000,
        duration: 1000
    },
    onLoad: function(options) {
        let that = this
        this.setData({
            product_id: options.id
        })
        if (app.globalData.access_token) {
            this.getData()
        } else {
            util.reLogin(res=>{
                that.getData()
            })
        }

    },
    getData() {
        util.getData(`cards/products/${this.data.product_id}`, {}, res => {
            if (res.data.code == 0) {
                this.setData({
                    detailData: res.data.data,
                    userData: res.data.data.card,
                    in_wallet: res.data.data.card.in_wallet,
                    save: res.data.data.card.save
                })
                WxParse.wxParse('description', 'html', this.data.detailData.detail, this, 5);
            }
        })

    },
    animation() {
        if (this.data.in_wallet) {
            util.postData('user/wallet/remove/' + this.data.userData.id, {}, res => {
                if (res.data.code == 0) {
                    if (this.data.save > 0) {
                        this.setData({
                            in_wallet: false,
                            save: this.data.save - 1
                        })
                    }
                    wx.showToast({
                        title: '已取消收藏',
                        icon: 'success',
                        duration: 600
                    })
                }
            })
        } else {
            util.postData('user/wallet/add/' + this.data.userData.id, {}, res => {
                if (res.data.code == 0) {
                    this.setData({
                        in_wallet: true,
                        save: this.data.save + 1
                    })
                    wx.showToast({
                        title: '收藏成功',
                        icon: 'success',
                        duration: 600
                    })
                }
            })
        }
    },
    call() {
        wx.makePhoneCall({
            phoneNumber: this.data.userData.mobile
        })
    },
    onShow: function() {

    },
    toIndex() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    onShareAppMessage: function() {
        return {
            title: this.data.detailData.name
        }
    }
})