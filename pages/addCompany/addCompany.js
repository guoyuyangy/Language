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
    let that = this
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
        } else if (res.statusCode == 422) {
          if (res.data.errors.images[0] != null) {
            wx.showModal({
              title: '提示',
              content: res.data.errors.images[0],
              showCancel: false,
              success: function () { }
            })
          } 
          if (res.data.errors.intro[0] != null) {
            wx.showModal({
              title: '提示',
              content: res.data.errors.intro[0],
              showCancel: false,
              success: function () {}
            })
          } 
          if (res.data.errors.name[0] != null) {
            wx.showModal({
              title: '提示',
              content: res.data.errors.name[0],
              showCancel: false,
              success: function () { }
            })
          }
        }
      })
    }
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

          }, cancelTask => that.setData({
            cancelTask
          })
        );
      }
    })
  },
  insertImage(e) {
    var that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var filePath = res.tempFilePaths[0];
        qiniuUploader.upload(filePath, (res) => {
            console.log(res.imageURL)
            let current = that.data.detail
            that.setData({
              detail: `${current}<img src="${res.imageURL}" />`
            })
          }, (error) => {
            console.error('error: ' + JSON.stringify(error));
          }, {
            region: 'ECN',
            uptokenURL: `${app.globalData.host}/api/upload/token`,
            domain: 'http://card-cdn.jindongsoft.com',
            shouldUseQiniuFileName: false
          },
          (progress) => {

          }, cancelTask => that.setData({
            cancelTask
          })
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
          files.splice(e.currentTarget.id, 1)
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
          console.log(that.data.card_id)
          util.getDataPro(`cards/${that.data.card_id}/website `, {}, 'DELETE', '', res => {
            console.log(res)
            if (res.data.code == 0) {
              console.log(2222222222233333)
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