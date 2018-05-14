const app = getApp()
var util = require('../../utils/util.js');
const qiniuUploader = require("../../utils/qiniuUploader");
Page({
    data: {
        company: {},
        card_id: null
    },
    onLoad: function(options) {
        let that = this
        if (options.card_id) {
            this.setData({
                card_id: options.card_id
            })
            if (app.globalData.access_token) {
                that.getData()
            }else{
                util.reLogin(res=>{
                    that.getData()
                })
            }
        }
    },
    onShow: function() {

    },
    getData() {
        util.getData(`cards/${this.data.card_id}/website`, {}, res => {
            if (res.data.code == 0) {
                this.setData({
                    company: res.data.data
                })
            }
        })
    },
    toIndex() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    onShareAppMessage: function() {

    }
})