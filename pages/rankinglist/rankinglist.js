const app = getApp()
var util = require('../../utils/util.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		current_active_category: 0, // 当前选中分类
		menu: [
			{ name: '人气排名', api: 'get_send_rank' },
			{ name: '收藏排名', api: 'get_receive_like_rank' },
			{ name: '转发排名', api: 'get_send_like_rank' }
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
	onLoad: function (options) {
		this.init()
	},

	onShow: function() {
		this.search([], 'get_send_rank')
	},

	selectMenu: function (e) {
		this.init()
		let index = e.currentTarget.dataset.itemIndex
		this.setData({
			'current_active_category': index
		})
		this.search([], e.currentTarget.dataset.api)
	},

	search: function (listData, url) {
		util.paginationSearch(listData, url, this.data.searchData, 'loginState', res => {
			this.data.searchData.offset = res.data.length
			this.setData({
				listData: res.data,
				searchData: this.data.searchData,
				loading: res.loading,
				nomore: res.nomore,
				nodata: res.nodata,
				flag: true
			})
		})
	},

	init: function () {
		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					scrollHeight: res.windowHeight,
					listData: [],
					loading: true,
					nodata: false,
					nomore: false,
					searchData: {
						offset: 0,
						limit: 5
					},
					flag: true,
				})
			}
		})
	}
})
// {
//   "pagePath": "pages/rankinglist/rankinglist",
//   "text": "排行",
//   "iconPath": "/images/4.png",
//   "selectedIconPath": "/images/41.png"
// },
