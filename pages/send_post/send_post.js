// pages/send_post/send_post.js
var app = getApp();
const qiniuUploader = require("../../utils/qiniuUploader");
const util = require("../../utils/util");
const Zan = require('../../dist/index');

Page(Object.assign({}, Zan.Toast, {
  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    placeholder: '请输入你这一刻的想法……',
    content: '',
    user_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.getData('user', {}, res => {
      this.setData({
        user_id: res.data.data.card.id
      })
    });
  },

  back: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  deleteImage: function (e) {
    let index = e.currentTarget.dataset.index
    this.data.images.splice(index, 1);
    this.setData({
      images: this.data.images
    })
  },

  didPressChooesImage: function () {
    wx.chooseImage({
      success: (res) => {
        wx.showLoading({
          title: '正在上传',
        })
        var filePaths = res.tempFilePaths;
        for (var i = 0; i < filePaths.length; i++) {
          // 交给七牛上传
          qiniuUploader.upload(filePaths[i], (res) => {
            this.data.images.push(res.imageURL);
            this.setData({
              images: this.data.images
            });
          }, (error) => {
            console.error('error: ' + JSON.stringify(error));
          }, {
              region: 'ECN', // 华北区
              domain: 'http://card-cdn.jindongsoft.com',
              shouldUseQiniuFileName: true,
              uptokenURL: `${app.globalData.host}/api/upload/token`
            },
            (progress) => {

              if (progress.totalBytesExpectedToSend == progress.totalBytesSent) {
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功！',
                })
              }
              console.log('上传进度', progress.progress)
              console.log('已经上传的数据长度', progress.totalBytesSent)
              console.log('预期需要上传的数据总长度', progress.totalBytesExpectedToSend)
            }
          );

        }

      }
    })

  },

  publish: function (e) {
    // if (e.detail.userInfo) {
    //   let data = {
    //     name: e.detail.userInfo.nickName,
    //     avatar_url: e.detail.userInfo.avatarUrl
    //   }
    //   util.postData('update_user_info2', data, 'loginState', res => {})
    // }
    wx.request({
      url: `${app.globalData.host}/api/posts`,
      method: 'POST',
      data: {
        'user_id': this.data.user_id,
        'images': this.data.images,
        'content': this.data.content
      },
      header: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${app.globalData.access_token}`,
      },
      success: res => {
        if (res.data.err_code == 0) {
          this.back();
        }
      }
    });
  },
  // 输入框内容更改时触发
  _handleZanFieldChange({
    componentId,
    detail
  }) {
    this.setData({
      content: detail.value
    });
  },

  // 输入框内容更改时触发
  setConent: function (e) {
    this.setData({
      content: e.detail.value
    });
  },
}));