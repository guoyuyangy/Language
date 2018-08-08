// pages/discuss_list/discuss_list.js
const app = getApp();
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [],
    next: null,
    userInfo: null,
    loading: false,
    nomore: false,
    isPreviewTriggerOnShow: false,
    releaseFocus: false,
    releaseName: '', //被回复的用户昵称
    parent_comment_id: null, //被回复评论的id
    post_id: null, //被评论的帖子id
    replyContent: '',
    checking_version: true,

    title_desc: '加入我们的微信交流群', // 分享新鲜事～
    title_icon: '', // /images/camera.png
  },

  onLoad: function() {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    util.getData('get_checking_version', {}, res => {
      this.setData({
        checking_version: res.data.checking_version == app.globalData.version ? true : false,
      })

      if (!this.data.checking_version) {
        this.setData({
          title_desc: '分享新鲜事～',
          title_icon: '/images/camera.png',
        });

        util.reLogin(() => {
          util.getData('users/' + app.globalData.userid, {}, res => {
            app.globalData.user_info = res.data.data

            this.setData({
              userInfo: res.data.data
            });

            if (!this.data.isPreviewTriggerOnShow) {
              this.loadData(`${app.globalData.host}/api/posts`);
            } else {
              this.setData({
                isPreviewTriggerOnShow: false
              });
            }
          })
        })
      }
    })

  },

  loadData(url, isLoadMore = false) {
    if (url != null) {
      this.setData({
        loading: true
      });
      wx.request({
        url: url,
        method: 'GET',
        header: {
          'Accept': 'application/json',
        },
        success: res => {
          let posts = res.data.data.map(this.processPostData);
          if (isLoadMore) {
            this.data.posts = this.data.posts.concat(posts);
          } else {
            this.data.posts = posts;
          }

          this.setData({
            posts: this.data.posts,
            next: res.data.links.next,
            loading: false,
            nomore: res.data.links.next == null
          });
        }
      });
    }
  },

  gotoSentpost: function() {
    if (!this.data.checking_version) {
      wx.navigateTo({
        url: `/pages/send_post/send_post?user_id=${this.data.userInfo.id}`
      });
    }
    
  },

  processPostData: function(post) {
    if (this.data.userInfo && post.zan_user_ids.indexOf(this.data.userInfo.card.id) != -1) {
      post.zaned = true;
    }
    return post;
  },

  changeZanStatus: function(post_id, zan_user_names) {
    let index = this.getPostItemIndexByPostId(post_id);
    zan_user_names.push(this.data.userInfo.name);
    this.setData({
      [`posts[${index}].zaned`]: true,
      [`posts[${index}].zan_user_names`]: zan_user_names
    });
  },

  dianZan: function(e) {

    let alreadyZan = e.currentTarget.dataset.action;
    let post_id = e.currentTarget.dataset.postid;
    let zan_user_names = e.currentTarget.dataset.zanusers;

    if (alreadyZan) {
      this.cancelZan(post_id);
    } else {
      this.actAfterUserInfoComplet(() => {
        this.changeZanStatus(post_id, zan_user_names);
        wx.request({
          url: `${app.globalData.host}/api/zans`,
          method: 'POST',
          data: {
            'user_id': this.data.userInfo.card.id,
            'post_id': post_id
          },
          header: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${app.globalData.access_token}`,
          },
          success: res => {

          }
        });
      });


    }
  },

  cancelZan: function(post_id) {

    this.actAfterUserInfoComplet(() => {
      wx.request({
        url: `${app.globalData.host}/api/zans/cancel`,
        method: 'POST',
        data: {
          'user_id': this.data.userInfo.card.id,
          'post_id': post_id
        },
        header: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${app.globalData.access_token}`,
        },
        success: res => {
          if (res.data.data == true) {
            this.updatePost(post_id);
          }
        }
      });
    });


  },

  updatePost: function(post_id) {
    wx.request({
      url: `${app.globalData.host}/api/posts/${post_id}`,
      method: 'GET',
      header: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${app.globalData.access_token}`,
      },
      success: res => {
        let index = this.getPostItemIndexByPostId(post_id);
        this.data.posts[index] = this.processPostData(res.data.data);
        this.setData({
          posts: this.data.posts
        });
      }
    });
  },

  getPostItemIndexByPostId: function(target_post_id) {
    for (var i = 0; i < this.data.posts.length; i++) {
      if (this.data.posts[i].id == target_post_id) {
        return i;
      }
    }
  },

  reply: function(e) {
    let post_id = e.currentTarget.dataset.postid;
    let releaseName = e.currentTarget.dataset.releasename != undefined ?
      e.currentTarget.dataset.releasename : '';
    let parent_comment_id = e.currentTarget.dataset.parentid != undefined ?
      e.currentTarget.dataset.parentid : null;


    this.setData({
      releaseFocus: true,
      post_id: post_id,
      releaseName: releaseName,
      parent_comment_id: parent_comment_id,
    });
  },
  hideReply: function() {
    this.setData({
      releaseFocus: false,
    });
  },

  resetReplayInfo: function() {
    this.setData({
      post_id: null,
      releaseName: '',
      parent_comment_id: null,
      replyContent: '',
    });
  },

  setReplyContent: function(e) {
    this.setData({
      replyContent: e.detail.value
    });
  },

  sendReply: function() {

    this.actAfterUserInfoComplet(() => {
      wx.request({
        url: `${app.globalData.host}/api/comments`,
        method: 'POST',
        data: {
          'user_id': this.data.userInfo.card.id,
          'post_id': this.data.post_id,
          'parent_id': this.data.parent_comment_id,
          'content': this.data.replyContent
        },
        header: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${app.globalData.access_token}`,
        },
        success: res => {
          if (res.data.err_code == 0) {

            this.updatePost(this.data.post_id);
            this.resetReplayInfo();
          }
        }
      });
    });



  },

  actAfterUserInfoComplet: function(cb) {
    // if (app.shouldUpdateUserInfo()) {
    //   wx.getSetting({
    //     success: (res) => {
    //       if (!res.authSetting['scope.userInfo']) {
    //         wx.showModal({
    //           title: '用户未授权',
    //           content: '如需正常使用点赞，评论，发帖功能，请按确定并在授权管理中选中“用户信息”，然后返回即可',
    //           showCancel: false,
    //           success: (res) => {
    //             if (res.confirm) {
    //               wx.openSetting({
    //                 success: (res) => {
    //                   app.updateServerUserInfo()
    //                     .then((res) => {
    //                       this.setData({
    //                         userInfo: res
    //                       });
    //                     });
    //                 }
    //               });
    //             }
    //           }
    //         })
    //       } else {

    //       }
    //     }
    //   });
    // } else {
    //   cb();
    // }
    cb()
  },

  toSendPost: function() {
    this.actAfterUserInfoComplet(() => {

    });
    wx.navigateTo({
      url: `/pages/send_post/send_post?user_id=${this.data.userInfo.id}`
    });
  },

  deletePost: function(e) {
    let post_id = e.currentTarget.dataset.postid;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.host}/api/posts/${post_id}`,
            method: 'DELETE',
            header: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${app.globalData.access_token}`,
            },
            success: res => {
              if (res.data.err_code == 0) {
                this.data.posts.splice(this.getPostItemIndexByPostId(post_id), 1);
                this.setData({
                  posts: this.data.posts
                });
              }
            }
          });
        }
      }
    })
  },

  preview: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: e.currentTarget.dataset.list, // 需要预览的图片http链接列表
      complete: () => {
        this.setData({
          isPreviewTriggerOnShow: true
        });
      }
    })
  },

  addWx() {
    wx.setClipboardData({
      data: 'zhongwei',
      success: function(res) {
        wx.showToast({
          title: '已复制微信号',
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.loadData(`${app.globalData.host}/api/posts`);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.loadData(this.data.next, true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  postshow: function() {

  }

})