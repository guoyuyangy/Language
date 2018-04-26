const app = getApp()
var util = require('../../utils/util.js');
Page({

  data: {
    winHeight: "",
    currentTab: 0,
    listData: [],
    active: '',
    all: '', 
    loading: true,
    nodata: false,
    nomore: false,
    searchData: {
      offset: 0,
      limit: 10
    },
    flag: true,
  },

  onLoad: function (options) {
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight - 40
    });
  },

  onShow: function () {
    if (app.globalData.access_token) {
      this.search()
    }
  },

  search: function () {
    util.cardpaginationSearch(this.data.listData, 'statistics', this.data.searchData, 'loginState', res => {
      this.data.searchData.offset = res.data.length
      this.setData({
        listData: res.data,
        searchData: this.data.searchData,
        loading: res.loading,
        nomore: res.nomore,
        nodata: res.nodata,
        active: res.active,
        all: res.all,
        flag: true
      })
    })
  },

  //下拉分页显示
  bindDownLoad: function (e) {
    if (!this.data.flag || this.data.nomore) return
    this.setData({
      loading: true,
      flag: false
    })
    util.cardpaginationSearch(this.data.listData, 'statistics', this.data.searchData, 'loginState', res => {
      this.data.searchData.offset = res.data.length
      this.setData({
        listData: res.data,
        searchData: this.data.searchData,
        loading: res.loading,
        nomore: res.nomore,
        nodata: res.nodata,
        active: res.active,
        all: res.all,
        flag: true
      })
    })
  },

  onShareAppMessage: function () {

  }
})