const app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        name: null,
        price: null,
        detail: null,
        card_id: null,
        desc: null,
        type: null,
        product_id: null
    },
    onLoad: function(options) {
        this.setData({
            card_id: options.card_id
        })
        if (options.type) {
            this.setData({
                type: options.type,
                product_id: options.id,
            })
        }
    },
    onShow: function() {
        if (this.data.type == 'edit') {
            util.getData(`cards/products/${this.data.product_id}`, {}, res => {
                if (res.data.code == 0) {
                    this.setData({
                        name: res.data.data.name,
                        price: res.data.data.price,
                        desc: res.data.data.description,
                        detail: res.data.data.detail
                    })
                }
            })
        }
    },
    formSubmit: function() {
        let arr = {
            card_id: this.data.card_id,
            name: this.data.name,
            price: this.data.price,
            info: this.data.info,
            description: this.data.desc
        }
        if (this.data.type == 'edit') {
            util.postData(`cards/products/${this.data.product_id}`, arr, res => {
                console.log(res)
            })
        } else {
            util.postData('cards/products', arr, res => {
                console.log(res)
            })
        }
    },
    blurName: function(e) {
        this.setData({
            name: e.detail.value
        });
    },
    blurPrice: function(e) {
        this.setData({
            price: e.detail.value
        });
    },
    blurInfo: function(e) {
        this.setData({
            detail: e.detail.value
        });
    },
    blurDesc: function(e) {
        this.setData({
            desc: e.detail.value
        });
    }
})