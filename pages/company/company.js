const app = getApp()
var util = require('../../utils/util.js');
const qiniuUploader = require("../../utils/qiniuUploader");
Page({
    data: {
        company: {},
        card_id: null
    },
    onLoad: function(options) {
        console.log(options.card_id)
        if (options.card_id) {
            this.setData({
                card_id: options.card_id
            })
            util.getData(`cards/${this.data.card_id}/website`, {}, res => {
                if (res.data.code == 0) {
                    this.setData({
                        company: res.data.data
                    })
                }
            })
        }
    },
    onShow: function() {

    },
    onShareAppMessage: function() {

    }
})