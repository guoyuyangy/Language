const app = getApp()
var util = require('../../utils/util.js');
const qiniuUploader = require("../../utils/qiniuUploader");
Page({
    data: {
        name: null,
        price: null,
        detail: null,
        card_id: null,
        description: null,
        type: null,
        product_id: null,
        files: []
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
                        description: res.data.data.description,
                        detail: res.data.data.detail,
                        files: res.data.data.images
                    })
                }
            })
        }
    },
    formSubmit: function() {
        console.log(this.data.files)
        let arr = {
            card_id: this.data.card_id,
            name: this.data.name,
            price: this.data.price,
            info: this.data.info,
            description: this.data.description,
            detail: this.data.detail,
            images: this.data.files
        }
        if (this.data.type == 'edit') {
            util.postData(`cards/products/${this.data.product_id}`, arr, res => {
                if (res.data.code == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '修改成功',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                    url: '/pages/index/index'
                                })
                            }
                        }
                    })
                }
            })
        } else {
            util.postData('cards/products', arr, res => {
                if (res.data.code == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '发布成功',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                    url: '/pages/index/index'
                                })
                            }
                        }
                    })
                }
                if (res.data.status_code != 200) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.errors.name[0],
                        showCancel: false,
                        success: function(res) {}
                    })
                }
            })
        }
    },
    delete: function() {
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除此商品？',
            success: function(res) {
                if (res.confirm) {
                    util.getDataPro(`cards/products/${that.data.product_id}`, {}, 'DELETE', '', res => {
                        if (res.data.code == 0) {
                            wx.showModal({
                                title: '提示',
                                content: '删除成功',
                                showCancel: false,
                                success: function(res) {
                                    if (res.confirm) {
                                        wx.switchTab({
                                            url: '/pages/index/index'
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    chooseImage: function(e) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                var filePath = res.tempFilePaths[0];
                qiniuUploader.upload(filePath, (res) => {
                        that.setData({
                            files: that.data.files.concat(res.imageURL)
                        });
                    }, (error) => {
                        console.error('error: ' + JSON.stringify(error));
                    }, {
                        region: 'SCN',
                        uptokenFunc: function() {
                            return 'dr1NNxcYXH1AZsw83xFZxQ4SS-VGIiK-wNvVH5ln:lwkJzf4EYSX5Iu2wR_FjJwu_nmI=:eyJzY29wZSI6ImNkbmRhdGEiLCJkZWFkbGluZSI6MTUyNjA0MTQ0MX0=';
                        },
                        domain: 'http://cdn.puasu.com',
                        shouldUseQiniuFileName: false
                    },
                    (progress) => {

                    }, cancelTask => that.setData({ cancelTask })
                );
            }
        })
    },
    previewImage: function(e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
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
    blurDesc: function(e) {
        this.setData({
            description: e.detail.value
        });
    },
    blurDetail: function(e) {
        this.setData({
            detail: e.detail.value
        });
    }
})