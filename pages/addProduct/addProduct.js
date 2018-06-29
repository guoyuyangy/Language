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
    onShow: function() {
        
    },
    formSubmit: function() {
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
            count: 1,
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
                        region: 'ECN',
                        uptokenURL: `${app.globalData.host}/api/upload/token`,
                        domain: 'http://card-cdn.jindongsoft.com',
                        shouldUseQiniuFileName: false
                    },
                    (progress) => {

                    }, cancelTask => that.setData({ cancelTask })
                );
            }
        })
    },
    insertImage(e) {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                var filePath = res.tempFilePaths[0];
                qiniuUploader.upload(filePath, (res) => {
                        let current = that.data.detail
                        if(current != null){
                            that.setData({
                                detail: `${current}<img src="${res.imageURL}" />`
                            })
                        }else {
                            that.setData({
                                detail: `<img src="${res.imageURL}" />`
                            })
                        }
                        
                    }, (error) => {
                        console.error('error: ' + JSON.stringify(error));
                    }, {
                        region: 'ECN',
                        uptokenURL: `${app.globalData.host}/api/upload/token`,
                        domain: 'http://card-cdn.jindongsoft.com',
                        shouldUseQiniuFileName: false
                    },
                    (progress) => {

                    }, cancelTask => that.setData({ cancelTask })
                );
            }
        })
    },
    previewImage: function(e) {
        let that = this
        wx.showModal({
            title: '提示',
            content: '是否删除此图片？',
            success: function(res) {
                if (res.confirm) {
                    let files = that.data.files
                    files.splice(e.currentTarget.id,1)
                    that.setData({
                        files: files
                    })
                }
            }
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