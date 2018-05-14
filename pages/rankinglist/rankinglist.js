const app = getApp()
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current_active_category: 0, // 当前选中分类
        menu: [
            { name: '人气排名', api: 'statistics/view' },
            { name: '收藏排名', api: 'statistics/follow' },
            { name: '转发排名', api: 'statistics/forward' }
        ],
        index: 0,
        listData: [],
        scrollTop: 0,
        scrollHeight: 0,
        status: 0,
        start: 0,
        loading: true,
        nodata: false,
        nomore: false,
        searchData: {
            offset: 0,
            limit: 20
        },
        flag: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.init()
        wx.showLoading({
            title: '加载中',
        })
        if (app.globalData.access_token) {
            this.search([], 'statistics/view')
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
                                this.search([], 'statistics/view')
                            }
                        })
                    } else {
                        console.log('获取用户登录态失败！' + res.errMsg)
                    }
                }
            })
        }

    },

    onShow: function() {

    },

    selectMenu: function(e) {
        wx.showLoading({
            title: '加载中',
        })
        this.init()
        let index = e.currentTarget.dataset.itemIndex
        this.setData({
            'current_active_category': index
        })
        this.search([], e.currentTarget.dataset.api)
    },

    search: function(listData, url) {
        util.paginationSearch(listData, url, this.data.searchData, 'loginState', res => {
            // this.data.searchData.offset = res.data.length
            for (var i = 0; i < res.data.length; i++) {
                res.data[i].name = res.data[i].name.substring(0, 1)
            }
            this.setData({
                listData: res.data,
                searchData: this.data.searchData,
                loading: res.loading,
                nomore: res.nomore,
                nodata: res.nodata,
                flag: true
            })
            setTimeout(function(){
            	wx.hideLoading()
            },200)
        })
    },

    init: function() {
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    scrollHeight: res.windowHeight,
                    listData: [],
                    loading: true,
                    nodata: false,
                    nomore: false,
                    searchData: {
                        offset: 1,
                        limit: 50
                    },
                    flag: true,
                })
            }
        })
    },
    onShareAppMessage: function() {

    }
})