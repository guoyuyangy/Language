const app = getApp()
var util = require('../../utils/util.js');
var Zan = require('../../dist/index');

Page(Object.assign({}, Zan.Switch, {
    data: {
        userData: null,
        avatar: ['/images/default.png'],
    },
    onLoad() {
        let that = this
        wx.showLoading({
            title: '加载中',
        })
        this.data.requestToCreate = false;
    },
    onShow() {
        this.getData()
    },
    getData() {
        let that = this
        if (app.globalData.access_token) {
            util.getData('users/' + app.globalData.userid, {}, res => {
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
                wx.hideLoading()
                if (res.data.data.cards.length == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '您还没有创建名片，点击确定创建',
                        success: function(res) {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '/pages/edit/edit'
                                })
                            } else if (res.cancel) {

                            }
                        }
                    })
                } else {
                    this.setData({
                        userData: res.data.data.cards
                    })
                    app.globalData.internal = res.data.data.internal
                }
            })
        }
    },
    add() {
        wx.navigateTo({
            url: '/pages/edit/edit?type=add'
        })
    },
    edit(e) {
        wx.navigateTo({
            url: '/pages/edit/edit?type=edit&id='+e.currentTarget.dataset.itemId
        })
    },
    onShareAppMessage: function() {
        return {
            title: this.data.name + '的名片',
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