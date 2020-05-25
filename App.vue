<script>
export default {
	onLaunch: function() {
		console.log('App Launch');
		console.log(uni.getSystemInfoSync());
		 // 获取当前的设备信息
		  const systemInfo = uni.getSystemInfoSync()
		  console.log(systemInfo)
		  this.globalData.statusBarHeight = systemInfo.statusBarHeight
		  // 如果是iOS设备
		  if (systemInfo.system.indexOf('iOS') != -1) {
		    this.globalData.contentBarHeight = 44
		    this.globalData.navigationBarHeight = 44 + systemInfo.statusBarHeight
		    if (systemInfo.screenHeight >= 812) {
		      this.globalData.iPhoneX = true
		      this.globalData.bottomArea = 34
		    } else {
		      this.globalData.iPhoneX = false
		      this.globalData.bottomArea = 0
		    }
		  } else {
		    this.globalData.iPhoneX = false
		    this.globalData.bottomArea = 0
		    this.globalData.contentBarHeight = 48
		    this.globalData.navigationBarHeight = 48 + systemInfo.statusBarHeight
		  }
		  this.globalData.screenHeight = systemInfo.screenHeight
		  this.globalData.screenWidth = systemInfo.screenWidth
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	},
	globalData: { 
		// 状态栏的高度
		statusBarHeight: 0,
		// 导航栏的内容高度
		contentBarHeight: 0,
		// 导航栏的整体高度
		navigationBarHeight: 0,
		// 整个手机屏幕的高度
		screenHeight: 0,
		// 整个手机屏幕的宽度
		screenWidth: 0,
		// 底部安全
		bottomArea: 0,
		// 是否是iPhoneX
		iPhoneX: false
	}
};
</script>

<style>
/* 解决头条小程序组件内引入字体不生效的问题 */
/* #ifdef MP-TOUTIAO */
@font-face {
	font-family: uniicons;
	src: url('/static/uni.ttf');
}
/* #endif */
</style>
