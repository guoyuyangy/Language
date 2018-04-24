var app = getApp()

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const mathRand = n => {
    var code_str = ''
    for (var i = 0; i < 6; i++) {
        var num = Math.random() * 9;
        num = parseInt(num, 10);
        code_str += num
    }
    return code_str
}

const paginationSearch = (listData, api, data, header, callback) => {
    if (header == null) {
        header = { 'content-type': 'application/json' }
    } else {
        header = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${app.globalData.access_token}`
        }
    }
    wx.request({
        url: `${app.globalData.host}/api/` + api,
        method: 'GET',
        data: data,
        header: header,
        success: (res) => {
            var result = res.data.data.name != undefined ? res.data.data.items : res.data.data
            let datalist = listData
            for (var i = 0; i < result.length; i++) {
                datalist.push(result[i])
            }
            var temp = {}
            if (data.offset == 0 && result.length == 0) {
                temp.nodata = true
                temp.nomore = false
            } else if (result.length < data.limit) {
                temp.nodata = false
                temp.nomore = true
            } else {
                temp.nodata = false
                temp.nomore = false
            }

            temp.data = datalist
            temp.loading = false

            callback(temp)
        }
    })
}

const getData = (api, data, callback) => {
    let header = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${app.globalData.access_token}`
    }
    wx.request({
        url: `${app.globalData.host}/api/` + api,
        method: 'GET',
        data: data,
        header: header,
        success: res => {
            callback(res)
        }
    })
}

const postData = (api, data, callback) => {
    let header = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${app.globalData.access_token}`
    }
    wx.request({
        url: `${app.globalData.host}/api/` + api,
        method: 'POST',
        data: data,
        header: header,
        success: res => {
            callback(res)
        }
    })
}

function relationship(topuserid) {
    if (app.globalData.access_token) {
        this.request_after_login(topuserid);
    } else {
        wx.login({
            success: res => {
                if (res.code) {
                    //发起网络请求
                    wx.request({
                        url: `${app.globalData.host}/api/login`,
                        method: 'POST',
                        data: {
                            code: res.code
                        },
                        success: res => {
                            app.globalData.access_token = res.data.data.access_token
                            app.globalData.userid = res.data.data.userid
                            wx.setStorageSync('access_token', res.data.data.access_token)
                            this.request_after_login(topuserid);
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            }
        });
    }
}

function request_after_login(topuserid) {
    if (topuserid == null) {
        topuserid = ''
    }

    this.get_user_info_and_upload()

    // 分销关系
    wx.request({
        url: `${app.globalData.host}/api/distribution_relationship`,
        method: 'POST',
        data: {
            top_id: topuserid
        },
        header: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${app.globalData.access_token}`,
        },
        success: res => {}
    })
}

function get_user_info_and_upload() {
    wx.getUserInfo({
        lang: 'zh_CN',
        success: res => {
            var userInfo = res.userInfo
            var nickName = userInfo.nickName
            var avatarUrl = userInfo.avatarUrl
            var gender = userInfo.gender // 性别 0：未知、1：男、2：女
            var province = userInfo.province
            var city = userInfo.city
            var country = userInfo.country

            // 可以将 res 发送给后台解码出 unionId
            app.globalData.user_info = res.userInfo

            wx.request({
                url: `${app.globalData.host}/api/update_user_info2`,
                method: 'POST',
                data: {
                    'name': nickName,
                    'avatar_url': avatarUrl,
                    'gender': gender,
                    'city': city,
                    'country': country
                },
                header: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${app.globalData.access_token}`,
                },
                success: res => {}
            })
        }
    })
}

module.exports = {
    formatTime: formatTime,
    formatDate: formatDate,
    paginationSearch: paginationSearch,
    postData: postData,
    getData: getData,
    mathRand: mathRand,
    relationship: relationship,
    request_after_login: request_after_login,
    get_user_info_and_upload: get_user_info_and_upload
}