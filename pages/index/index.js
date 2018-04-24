const app = getApp()
var util = require('../../utils/util.js');
var Zan = require('../../dist/index');

Page(Object.assign({}, Zan.Switch, {
    data: {
        star: true,
        name: '',
        position: '',
        company: '',
        tel: '',
        bigtel: '',
        address: '',
        avatar: '/images/default.png',
        id: null,
        in_wallet: false,
        email: '',
        slogan: '',
        industry: '',
        forward: 0,
        hot: 0,
        save: 0
    },
    onLoad(options) {
        this.setData({
            id: options.id
        })
        wx.showLoading({
            title: '加载中',
        })
    },
    onShow() {
        if (app.globalData.access_token) {
            this.getData()
        }
    },
    getData() {
        let that = this
        util.postData('cards/' + that.data.id + '/forward', {}, res => {
            if (res.data) {

                wx.hideLoading()
            }
        })
    },
    open() {
        wx.switchTab({
            url: '/pages/user/user'
        })
    },
    animation() {
        if (this.data.in_wallet) {
            util.postData('user/wallet/remove/' + this.data.id, {}, res => {
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
            util.postData('user/wallet/add/' + this.data.id, {}, res => {
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
    preview() {
        wx.previewImage({
            urls: this.data.avatar
        })
    },
    call() {
        wx.makePhoneCall({
            phoneNumber: this.data.tel
        })
    },
    tel() {
        wx.makePhoneCall({
            phoneNumber: this.data.bigtel
        })
    },
    contact() {
        wx.addPhoneContact({
            firstName: this.data.name,
            title: this.data.position,
            organization: this.data.company,
            mobilePhoneNumber: this.data.tel,
            workPhoneNumber: this.data.bigtel,
            workAddressStreet: this.data.address,
            success: function(res) {
                wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                    duration: 800
                })
            }
        })
    },
    onShareAppMessage: function() {
        return {
            title: this.data.name + '的名片',
            path: '/pages/index/index?id=' + this.data.id,
            success: (res) => {
                util.postData('users/' + this.data.id + '/forward', {}, res => {})
                wx.showToast({
                    title: '转发成功',
                    icon: 'success',
                    duration: 800
                })
            }
        }
    }
}));