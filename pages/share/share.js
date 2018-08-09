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
    wechat_id: null,
    in_wallet: false,
    products: [],
    companyData: null
  },
  onLoad(options) {
    this.setData

    ({
      id: options.id,
      type: options.type
    })
    wx.showLoading({
      title: '加载中',
    })
  },
  onShow() {
    let that = this
    if (app.globalData.access_token) {
      this.getData()
    } else {
      util.reLogin(res => {
        that.getData()
      })
    }
  },
  getData() {
    let that = this
    util.getData('cards/' + that.data.id, {}, res => {
      app.globalData.sharing = 1
      if (res.statusCode == 403) {
        util.reLogin(res => {
          that.getData()
        })
      }
      if (res.statusCode == 200) {
        this.setData({
          userData: res.data.data,
          save: res.data.data.save,
          in_wallet: res.data.data.in_wallet,
          wechat_id: res.data.data.wechat_id          
        })
        util.getData('cards/products', {
          card_id: res.data.data.id
        }, res => {
          this.setData({
            products: res.data.data
          })
        })
        util.getData(`cards/${res.data.data.id}/website`, {}, res => {
          this.setData({
            companyData: res.data.data
          })
        })
        wx.hideLoading()
      }
      if (res.statusCode == 404) {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '该名片已经被删除',
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
  },
  open() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  edit() {
    wx.navigateTo({
      url: '/pages/edit/edit?type=edit&id=' + this.data.id
    })
  },
  animation() {
    if (this.data.in_wallet) {
      app.globalData.wallet = 1
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
      app.globalData.wallet = 1
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
  addWx() {
    wx.setClipboardData({
      data: this.data.wechat_id,
      success: function(res) {
        wx.showToast({
          title: '已复制微信号',
          icon: 'success',
          duration: 1500
        })
      }
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