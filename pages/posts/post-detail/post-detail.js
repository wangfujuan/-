var postsData = require('../../../data/posts-data.js');
var app = getApp();
Page({
  data:{
    isPlayingMusic: false
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    var postId = options.id;
    console.log(postId);
    this.data.currentPostId = postId;
    
    var postData = postsData.postList[postId];

    //如果在onLaod方法中，不是异步的去执行一个数据绑定
    //则不需要使用this.setData方法
    //只需要对this.data赋值即可实现数据绑定
    //this.data.postData = postData;
    this.setData({
      postData: postData
    });

    var postsCollected = wx.getStorageSync('posts_Collected');
    if(postsCollected){
      var itemCollected = postsCollected[postId];
      if (itemCollected) {
        this.setData({
          collected: itemCollected
        })
      } 
    }else{
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_Collected', postsCollected);
      //缓存的上限最大不能超过10MB
    }

    if(app.globalData.g_isPlayingMusic &&  app.globalData.g_currentMusicPostId===postId){
      this.setData({
        isPlayingMusic: true
      })

    }
    this.setMusicMonitor();
    
    
  },

  setMusicMonitor: function(){
    var that = this;
    wx.onBackgroundAudioPlay(function() {
      that.setData({
        isPlayingMusic: true
      })
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentMusicPostId = that.data.currentPostId;
    })
    wx.onBackgroundAudioPause(function() {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentMusicPostId = null;
    })
  },

  onCollectionTap: function(event){
    var postsCollected = wx.getStorageSync('posts_Collected');
    var postCollected = postsCollected[this.data.currentPostId];
    //收藏变成未收藏，未收藏变成收藏
    postCollected = !postCollected;
    postsCollected[this.data.currentPostId] = postCollected;
    //更新文章是否的缓存值
    wx.setStorageSync('posts_Collected', postsCollected);
    //更新数据绑定变量，从而实现图片切换
    this.setData({
      collected : postCollected
    })

    wx.showToast({
      title: postCollected? "收藏成功":"取消成功",
      duration: 1000,
      icon: "success",
    })
  },

  onShareTap: function(event){
    var itemList = [
      "分享给微信好友",
      "分享到朋友圈",
      "分享到QQ"
    ];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: "#405f80",
      success: function(res){
        wx.showModal({
          title: "用户 "+itemList[res.tapIndex],
          content: "用户是否取消？"+res.cancel+"现在无法实现分享功能"
        })
      }
    })
  },

  onMusicTap: function(event){
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId];
    console.log(postData);
    var isPlayingMusic = this.data.isPlayingMusic;
    if(isPlayingMusic){
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic:false
      })
    }
    else{
      wx.playBackgroundAudio({
        dataUrl: postData.music.dataUrl,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImgUrl
      });
      this.setData({
        isPlayingMusic:true
      })
    }
    

    
  }
  
})