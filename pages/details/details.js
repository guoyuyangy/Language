var app = getApp()
var WxParse = require("../../wxParse/wxParse.js")
var util = require('../../utils/util.js');
Page({
    data: {
        product_id: null,
        userData: null,
        in_wallet: false,
        save: null
    },
    onLoad: function(options) {
        this.setData({
            product_id: options.id
        })
        if(app.globalData.access_token){
            this.getData()
        }else{
            setTimeout(function(){
                this.getData()
            },1000)
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
})