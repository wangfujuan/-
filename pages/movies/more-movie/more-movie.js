var app = getApp();//获取全局
var util = require('../../../utils/util.js');
Page({
  data:{
    movies:{},
    requestUrl: "",
    totalCount: 0,
    isEmpty: true,
  },
  onLoad:function(options){
    var category = options.category;
    //console.log(category);
    switch(category){
      case "正在热映":
         var dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters";
         break;
      case "即将上映":
         var dataUrl = app.globalData.doubanBase + "/v2/movie/coming_soon";
         break;
      case "Top250":
         var dataUrl = app.globalData.doubanBase + "/v2/movie/top250"; 
         break;
    }
    this.setData({
      requestUrl: dataUrl
    })
    util.http(dataUrl,this.processDoubanData);

    wx.setNavigationBarTitle({
      title: category,
      success: function(res) {
        // success
      }
    })
  },
  processDoubanData: function(moviesDouban){
    var movies = [];
    for(var idx in moviesDouban.subjects){
      var subject =  moviesDouban.subjects[idx];
      var title = subject.title;
      if(title.length >= 6){
        title = title.substring(0,6) + "...";
      }
      var temp = {
        stars : util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id,
      }
      movies.push(temp);
    }
    var totalMovies = {};
    
    if(!this.data.isEmpty){
      totalMovies = this.data.movies.concat(movies);
    }else{
      totalMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies
    });
    this.data.totalCount += 20;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReachBottom: function(event){
    console.log('222');
    var nextUrl = this.data.requestUrl + "?start=" + this.data.totalCount + "&count=20";
    util.http(nextUrl,this.processDoubanData);
    wx.showNavigationBarLoading();
  },
  onPullDownRefresh: function(){
    var refreshUrl = this.data.requestUrl + "?start=0&count=20";
    this.data.movies = {};
    this.data.isEmpty = true;
    util.http(refreshUrl, this.processDoubanData);
    wx.showNavigationBarLoading();
  }
})