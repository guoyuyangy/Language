const app = getApp()
var util = require('../../utils/util.js');
const qiniuUploader = require("../../utils/qiniuUploader");
Page({
    data: {
        name: null,
        detail: null,
        card_id: null,
        type: null,
        company_id: null,
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
            util.getData(`cards/${this.data.card_id}/website`, {}, res => {
                if (res.data.code == 0) {
                    this.setData({
                        name: res.data.data.name,
                        detail: res.data.data.intro,
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
            intro: this.data.detail,
            images: this.data.files
        }
        if (this.data.type == 'edit') {
            util.postData(`cards/${this.data.card_id}/website/update`, arr, res => {
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
            util.postData(`cards/${this.data.card_id}/website`, arr, res => {
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
            })
        }
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
    blurDetail: function(e) {
        this.setData({
            detail: e.detail.value
        });
    },
    delete: function() {
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定删除公司信息？',
            success: function(res) {
                if (res.confirm) {
                    util.getDataPro(`cards/${that.data.card_id}/website `, {}, 'DELETE', '', res => {
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
})