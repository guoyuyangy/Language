var app = getApp()
var WxParse = require("../../wxParse/wxParse.js")
var util = require('../../utils/util.js');
Page({
    data: {
        product_id: null
    },
    onLoad: function(options) {
        this.setData({
            product_id: options.id
        })
        this.getData()
    },
    getData(){
        util.getData(`cards/products/${this.data.product_id}`, {}, res => {
            if (res.data.code == 0) {
                this.setData({
                    detailData: res.data.data
                })
            }
        })

    },
    onShow: function() {

    },
})