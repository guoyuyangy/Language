const app = getApp()
var util = require('../../utils/util.js');
var Zan = require('../../dist/index');
var $loading

Page(Object.assign({}, Zan.Switch, {
  data: {
    avatar: '/images/default.png',
    userData: null,
    save: 0,
    wechat_id: null,
    in_wallet: false,
    id: null,
    isExist: false,
    products: [],
    companyData: null,
    saving: 0,
    forwarding: 0
  },
  onLoad(options) {
    $loading = this.selectComponent(".J_loading")
    $loading.show()
    var that = this
    this.getData();
  },
  onReady: function() {
    this.animation = wx.createAnimation()
  },
  onShow() {
    this.timeout()
    let that = this
    if (app.globalData.access_token) {
      this.getData()
    } else {
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
  timeout() {
    setTimeout(function() {
      this.animation.translate(0, 30).step({
          duration: 1000
        })
        .translate(0, 0)
        .step({
          duration: 1000
        })
      this.setData({
        animation: this.animation.export()
      })

    }.bind(this), 1000)
  },
  getData() {
    let that = this
    var userList = wx.getStorageSync('userList')
    if (!userList) {        //无缓存
      util.getData('user', {}, res => {
        if (res.statusCode == 403) {
          util.reLogin(res => {
            that.getData()
          })
        }
        if (res.data.data.card != null) {
          wx.setStorageSync('userList', res.data.data)
          this.setData({
            isExist: true,
            userData: res.data.data.card,
            save: res.data.data.card.save,
            wechat_id: res.data.data.card.wechat_id,
            in_wallet: res.data.data.card.in_wallet,
            id: res.data.data.card.id
          })
          util.getData('cards/products', {
            card_id: res.data.data.card.id
          }, res => {
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
    } else {        //有缓存
      if (app.globalData.codes == 1 || this.data.saving == 1 || this.data.forwarding == 1 || app.globalData.sharing == 1) {    //数据发生改变
        util.getData('user', {}, res => {
          wx.setStorageSync('userList', res.data.data)
          if (!res.data.data.card) {      //无名片
            this.setData({
              isExist: false,
              userData: null,
            })
          } else {                        //有名片
            util.getData('user', {}, res => {
              wx.setStorageSync('userList', res.data.data)              
              this.setData({
                isExist: true,
                userData: res.data.data.card,
                save: res.data.data.card.save,
                wechat_id: res.data.data.card.wechat_id,                
                in_wallet: res.data.data.card.in_wallet,
                id: res.data.data.card.id,
                saving: 0
              })
            })
            util.getData('cards/products', {
              card_id: res.data.data.card.id
            }, res => {
              this.setData({
                products: res.data.data
              })
            })
            util.getData(`cards/${res.data.data.card.id}/website`, {}, res => {
              this.setData({
                companyData: res.data.data
              })
            })
          }
          wx.hideLoading()
          $loading.hide()
        })
        app.globalData.codes = 0
      } else {                  //数据未发生改变
        var userDatas = wx.getStorageSync('userList')
        wx.hideLoading()
        $loading.hide()
        this.setData({
          isExist: true,
          userData: userDatas.card,
          save: userDatas.card.save,
          wechat_id: userDatas.card.wechat_id,          
          in_wallet: userDatas.card.in_wallet,
          id: userDatas.card.id,
          name: userDatas.name
        })
        util.getData('user', {}, res => {
          util.getData('cards/products', {
            card_id: res.data.data.card.id
          }, res => {
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
        })
      }
    }
  },
  open() {
    wx.switchTab({
      url: '/pages/user/user'
    })
  },
  edit() {
    wx.navigateTo({
      url: '/pages/edit/edit?type=edit&id=' + this.data.id
    })
  },
  add() {
    wx.navigateTo({
      url: '/pages/edit/edit?type=add'
    })
  },
  animations() {
    app.globalData.wallet = 1                         
    if (this.data.in_wallet) {
      util.postData('user/wallet/remove/' + this.data.id, {}, res => {
        if (res.data.code == 0) {
          if (this.data.save > 0) {
            this.setData({
              in_wallet: false,
              save: this.data.save - 1,
              saving: 1
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
            save: this.data.save + 1,
            saving: 1
          })
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 600
          })
        }
      })
    }
    this.getData();
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
      url: '/pages/addProduct/addProduct?card_id=' + this.data.id
    })
  },
  creat() {
    wx.navigateTo({
      url: '/pages/addCompany/addCompany?card_id=' + this.data.id
    })
  },
  addWx() {
    wx.setClipboardData({
      data: this.data.wechat_id,
      success: function (res) {
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
        app.globalData.codes == 1
        this.setData({
          forwarding: 1          
        })
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 800
        })
      }
    }
  }
}));