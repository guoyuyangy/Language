// pages/jindong/jindong.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    name: ''
  },
  imgYu: function(event) {
    wx.previewImage({
      urls: ['http://beibeicdn.jindongsoft.com/beibei_5a176e5c9218d']
    })
  }
})