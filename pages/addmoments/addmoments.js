const app = getApp()
var util = require('../../utils/util.js');
var WxParse = require("../../wxParse/wxParse.js")
Page({
  data: {
    post: {},
    next: null,
    userInfo: null,
    posts_id: null,
    product_id: null,
    userData: null,
    in_wallet: false,
    save: null,
    detailData: null,
    companyData: null
  },
  onLoad: function (options) {
    let that = this
    if (options.posts_id) {
      this.setData({
        posts_id: options.posts_id
      })
      if (app.globalData.access_token) {
        that.getData()
      } else {
        util.reLogin(res => {
          that.getData()
        })
      }
    }
  },
  onShow: function () {

  },
  getData() {
    util.getData(`posts/${this.data.posts_id}`, {}, res => {
      if (res.data.err_code == 0) {
        this.setData({
          post: res.data.data
        })
        WxParse.wxParse('description', 'html', this.data.post.content, this, 5);
      }
    })
    let that = this
    util.getData('user', {}, res => {
      if (res.statusCode == 403) {
        util.reLogin(res => {
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
        util.getData('cards/products', { card_id: res.data.data.card.id }, res => {
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
        $loading.hide()
      } else {
        this.setData({
          isExist: false
        })
        wx.hideLoading()
        $loading.hide()
      }
    })
  },
  animation() {
    if (this.data.in_wallet) {
      util.postData('user/wallet/remove/' + this.data.userData.id, {}, res => {
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
      util.postData('user/wallet/add/' + this.data.userData.id, {}, res => {
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
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  onShareAppMessage: function () {

  }
})