const app = getApp()
var util = require('../../utils/util.js');
var Zan = require('../../dist/index');

Page(Object.assign({}, Zan.Switch, {
    data: {
        avatar: '/images/default.png',
        userData: null,
        type: null,
        id: null,
        save: 0,
        in_wallet: false
    },
    onLoad(options) {
        this.setData({
            id: options.id,
            type: options.type
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
        util.getData('cards/' + that.data.id, {}, res => {
            if (res.data.data.name) {
                this.setData({
                    userData: res.data.data,
                    save: res.data.data.save,
                    in_wallet: res.data.data.in_wallet
                })
                wx.hideLoading()
            }
        })
    },
    open() {
        wx.switchTab({
            url: '/pages/user/user'
        })
    },
    edit() {
        wx.navigateTo({
            url: '/pages/edit/edit?type=edit&id='+ this.data.id
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
    call() {
        wx.makePhoneCall({
            phoneNumber: this.data.userData.mobile
        })
    },
    tel() {
        wx.makePhoneCall({
            phoneNumber: this.data.userData.tel
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
            title: this.data.userData.name + '的名片',
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