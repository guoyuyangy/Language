const app = getApp()
var util = require('../../utils/util.js');
var WxParse = require("../../wxParse/wxParse.js")
Page({
  data: {
    post: {},
    next: null,
    userInfo: null,
    posts_id: null,
    products: null,
    post_owner: null,
    content: null,
    detailData: null,
    companyData: null,
    share: null,
    releaseFocus: false,
    userData: null,
    isExist: false,
    save: null,
    in_wallet: false,
    id: null
  },
  onLoad: function(options) {
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
  onShow: function(options) {
    util.reLogin(() => {
      util.getData('users/' + app.globalData.userid, {}, res => {
        app.globalData.user_info = res.data.data
        this.setData({
          userInfo: res.data.data
        });
      })
    })
  },
  getData() {
    util.getData(`posts/${this.data.posts_id}`, {}, res => {
      if (res.data.err_code == 0) {
        this.setData({
          post: res.data.data,
          post_owner: res.data.data.post_owner,
          content: res.data.data.content,
          in_wallet: res.data.data.post_owner.expose
        })
        util.getData('user', {}, res => {
          if (res.data.data.card != null) {
            this.setData({
              isExist: true,
              userData: res.data.data.card,
              save: res.data.data.card.save,
              in_wallet: res.data.data.card.in_wallet,
              id: res.data.data.card.id
            })
          }
        })
        util.getData(`cards/${res.data.data.post_owner.id}/website`, {}, res => {
          this.setData({
            companyData: res.data.data
          })
        })
        util.getData('cards/products', {
          card_id: res.data.data.post_owner.id
        }, res => {
          this.setData({
            products: res.data.data
          })
        })
        WxParse.wxParse('description', 'html', this.data.post.content, this, 5);
      }
    })
  },
  toIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  add_card() {
    wx.navigateTo({
      url: '/pages/edit/edit?type=add_card'
    })
  },
  add_article(){
    wx.navigateTo({
      url: '/pages/send_post/send_post?type=add_article'
    })
  },
  onShareAppMessage: function(res) {
    if (this.data.post.images[0]) {
      return {
        title: this.data.content.split("\n")[0],
        imageUrl: this.data.post.images[0]
      }
    } else {
      return {
        title: this.data.content.split("\n")[0],
      }
    }
  },
  preview: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: e.currentTarget.dataset.list, // 需要预览的图片http链接列表
    })
  },
})