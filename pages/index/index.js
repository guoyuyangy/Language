const app = getApp()
var util = require('../../utils/util.js');
var Zan = require('../../dist/index');

Page(Object.assign({}, Zan.Switch, {
    data: {
        avatar: '/images/default.png',
        userData: null,
        save: 0,
        in_wallet: false,
        id: null,
        isExist: false,
        products: [],
        companyData: null
    },
    onLoad(options) {
        wx.showLoading({
            title: '加载中',
        })
    },
    onShow() {
        let that = this
        if (app.globalData.access_token) {
            this.getData()
        }else{
            wx.login({
                success: res => {
                    if (res.code) {
                        //发起网络请求
                        wx.request({
                            url: `${app.globalData.host}/api/auth/login`,
                            method: 'POST',
                            data: {
                                code: res.code
                            },
                            success: res => {
                                app.globalData.access_token = res.data.data.access_token
                                app.globalData.userid = res.data.data.user_id
                                wx.setStorageSync('access_token', res.data.data.access_token)
                                this.getData()
                            }
                        })
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg)
                    }
                }
            })
        }
    },
    getData() {
        let that = this
        util.getData('user', {}, res => {
            console.log(res)
            if(res.statusCode == 403){
                util.reLogin(res=>{
                    that.getData()
                })
            }
            if (res.data.data.card != null) {
                this.setData({
                    isExist: true,
                    userData: res.data.data.card,
                    save: res.data.data.card.save,
                    in_wallet: res.data.data.card.in_wallet,
                    id: res.data.data.card.id
                })
                util.getData('cards/products', {card_id: res.data.data.card.id}, res => {
                    this.setData({
                        products: res.data.data
                    })
                })
                util.getData(`cards/${res.data.data.card.id}/website`, {}, res => {
                    this.setData({
                        companyData: res.data.data
                    })
                })
                wx.hideLoading()
            }else{
                this.setData({
                    isExist: false
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
    add() {
        wx.navigateTo({
            url: '/pages/edit/edit?type=add'
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
            firstName: this.data.userData.name,
            title: this.data.userData.title,
            organization: this.data.userData.company,
            mobilePhoneNumber: this.data.userData.mobile,
            workPhoneNumber: this.data.userData.tel,
            workAddressStreet: this.data.userData.address.name,
            success: function(res) {
                wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                    duration: 800
                })
            }
        })
    },
    show() {
        wx.navigateTo({
            url: '/pages/addProduct/addProduct?card_id='+ this.data.id
        })
    },
    creat(){
        wx.navigateTo({
            url: '/pages/addCompany/addCompany?card_id='+ this.data.id
        })
    },
    onShareAppMessage: function() {
        return {
          title: this.data.userData.name + '的名片，敬请惠存',
            path: '/pages/share/share?id=' + this.data.id,
            success: (res) => {
                util.postData('cards/' + this.data.id + '/forward', {}, res => {})
                wx.showToast({
                    title: '转发成功',
                    icon: 'success',
                    duration: 800
                })
            }
        }
    }
}));