const app = getApp()
var util = require('../../utils/util.js');
Page({
    data: {
        avatar: '/images/default.png',
        index: 0,
        tel: null,
        name: null,
        bigtel: null,
        address: null,
        company: null,
        title: null,
        slogan: null,
        email: null,
        array: [],
        isLocation: false,
    },
    onLoad: function(options) {
        if(options.type == 'edit'){
            this.editData()
        }
    },
    onShow: function() {
        wx.getUserInfo({
            success: (res) => {
                var userInfo = res.userInfo
                var avatarUrl = userInfo.avatarUrl
                this.setData({
                    avatar: avatarUrl
                })
                if (this.data.name == null) {
                    this.setData({
                        name: userInfo.nickName
                    })
                }
            }
        })
        let that = this
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userLocation'] || res.authSetting['scope.userLocation'] == undefined) {
                    that.setData({
                        isLocation: true
                    })
                } else {
                    that.setData({
                        isLocation: false
                    })
                }
            }
        })

    },
    editData: function() {
        let that = this
        if (app.globalData.access_token) {
            util.getData('industries', {}, res => {
                let industry = []
                for (var i = 0; i < res.data.data.length; i++) {
                    industry.push(res.data.data[i].name)
                }
                that.setData({
                    array: industry
                })
            })
            util.postData('users/' + app.globalData.userid, {}, res => {
                if (res.data) {
                    let address = ''
                    if (res.data.data.address.name) {
                        address = res.data.data.address.name
                    }
                    that.setData({
                        name: res.data.data.name,
                        title: res.data.data.title,
                        company: res.data.data.company,
                        tel: res.data.data.mobile,
                        bigtel: res.data.data.tel,
                        email: res.data.data.email,
                        address: address,
                        slogan: res.data.data.slogan,
                        index: parseInt(res.data.data.industry_id) - 1
                    })
                    wx.hideLoading()
                }
            })
        }
    },
    getAddress: function() {
        let that = this
        wx.chooseLocation({
            type: 'gcj02',
            success: function(res) {
                var latitude = res.latitude
                var longitude = res.longitude
                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    address: res.address
                })
            },
            fail: function() {
                that.setData({
                    isLocation: false
                })
            }
        })
    },
    nameChange: function(e) {
        this.setData({
            name: e.detail.value
        })
    },
    telChange: function(e) {
        this.setData({
            tel: e.detail.value
        })
    },
    bigtelChange: function(e) {
        this.setData({
            bigtel: e.detail.value
        })
    },
    addressChange: function(e) {
        this.setData({
            address: e.detail.value
        })
    },
    titleChange: function(e) {
        this.setData({
            title: e.detail.value
        })
    },
    companyChange: function(e) {
        this.setData({
            company: e.detail.value
        })
    },
    sloganChange: function(e) {
        this.setData({
            slogan: e.detail.value
        })
    },
    emailChange: function(e) {
        this.setData({
            email: e.detail.value
        })
    },
    bindPickerChange: function(e) {
        this.setData({
            index: e.detail.value
        })
    },
    formSubmit: function(e) {
        let that = this
        let formData = {
            name: that.data.name,
            mobile: that.data.tel,
            title: that.data.title,
            address: {
                name: that.data.address,
                location: {
                    lat: that.data.latitude,
                    lng: that.data.longitude
                }
            },
            company: that.data.company,
            tel: that.data.bigtel,
            avatar: that.data.avatar,
            slogan: that.data.slogan,
            industry_id: parseInt(that.data.index) + 1,
            email: that.data.email
        }
        util.postData('cards', formData, res => {
            if (res.data.code == 0) {
                wx.showModal({
                    title: '提示',
                    content: '保存成功',
                    showCancel: false,
                    success: function() {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })
            } else if (res.statusCode == 422) {
                var keys = Object.keys(res.data.errors);
                wx.showModal({
                    title: '提示',
                    content: res.data.errors[keys[0]][0],
                    showCancel: false,
                    success: function() {

                    }
                })
            }
        })
    }
})