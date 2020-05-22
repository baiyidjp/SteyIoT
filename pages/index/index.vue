<template>
	<view class="container" :style="{marginTop: statusBarHeight}">
		<view v-if="isLogin">
			<van-dropdown-menu active-color="#5a2b81">
				<van-dropdown-item :value="currentRoomValue" :options="roomNameValues"></van-dropdown-item>
			</van-dropdown-menu>
			<scroll-view scroll-y="true" :show-scrollbar="true" :style="{height: scrollViewHeight}">
				<view class="zone-section-container" v-for="(zone, zoneIndex) in roomZones" :key="zone.zoneId">
					<view class="zone-section-title">{{ zone.zoneName }}</view>
					<van-grid :column-num="gridColumn" gutter="12rpx" custom-class="grid-container">
						<van-grid-item use-slot content-class="grid-item-content" v-for="(device, deviceIndex) in zone.devices" :key="device.zoneDeviceId">
							<view class="zone-device-container" @click="deviceItemClick(deviceIndex)">
								<view class="device-left">
									<image class="device-image" src="/static/images/icon_light_off.png" mode=""></image>
									<text class="state-text">已关闭</text>
									<text class="device-name">{{ device.deviceName }}</text>
								</view>
								<view class="device-right">
									<view class="switch-color"></view>
									<image class="setting-image" src="/static/images/icon_settings.png" mode=""></image>
								</view>
							</view>
						</van-grid-item>
					</van-grid>
				</view>
			</scroll-view>
		</view>
		<view v-else class="login-container">
			<view>{{ loginTip }}</view>
			<view class="login-button" @click="loginButtonClick">点我登录</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import SpaceModel from './space-model.js'
	import RoomZoneModel from './room-zone.js'
	export default {
		data() {
			return {
				statusBarHeight: '0px',
				scrollViewHeight: '0px',
				loginTip: '当前未登录',
				gridColumn: 2,
				roomNameValues: [],
				currentRoomValue: null,
				roomZones: []
			}
		},
		onLoad() {
			this.statusBarHeight = `${getApp().globalData.statusBarHeight}px`
			const scrollHeight = getApp().globalData.screenHeight - getApp().globalData.statusBarHeight - getApp().globalData.bottom - 44
			this.scrollViewHeight = `${scrollHeight}px`
		},
		onShow() {
			if (this.isLogin) {
				this.requestAccessibleSpaces()
			}
		},
		computed: {
			...mapState(['isLogin'])
		},
		methods: {
			...mapMutations(['logout']),
			loginButtonClick() {
				uni.navigateTo({
					url:'../login/login'
				})
			},
			tapCurrentRoom() {
				
			},
			requestAccessibleSpaces() {
				// 请求spaces信息
				uni.request({
					url: 'https://gateway.stey.com/iot-service/app/iot/accessible-spaces',
					method: 'GET',
					data: {},
					header: {
						'Content-Type': 'application/json; charset=utf-8',
						'Authorization': `Bearer ${uni.getStorageSync('token')}`,
						'Accept-Language': 'zh'
					},
					success: res => {
						console.log(res);
						if (res.statusCode == 200) {
							this.handleAccessibleSpaces(res.data.data)
						} else if (res.statusCode == 401) {
							console.log('token失效')
							this.logout()
							this.loginTip = '登录失效'
						} else {
							const error = res.data.error
							if (error) {
								uni.showToast({
									icon: 'none',
									title: error,
									duration: 2000
								});
							}
						}
					},
					fail: () => {
						uni.showToast({
							icon: 'none',
							title: '网络请求失败',
							duration: 2000
						})
					}
				})
			},
			handleAccessibleSpaces(data) {
				const spaces = data.map((obj) => new SpaceModel(obj))
				if (spaces.length > 0) {
					this.currentRoomValue = spaces[0].spaceId
					this.roomNameValues = spaces.map((space) => {
						const obj = {text: space.roomName, value: space.spaceId}
						return obj
					})
					this.requestIoTTemplate()
				} else {
					this.currentRoomValue = 18
					this.roomNameValues = [
						{text: '502', value: 18}
					]
					this.requestIoTTemplate()
				}
			},
			requestIoTTemplate(spaceId) {
				if (this.currentRoomValue) {
					uni.request({
						url: `https://gateway.stey.com/iot-service/staff-app/iot/template/${this.currentRoomValue}`,
						method: 'GET',
						data: {},
						header: {
							'Content-Type': 'application/json; charset=utf-8',
							'Authorization': `Bearer ${uni.getStorageSync('token')}`,
							'Accept-Language': 'zh'
						},
						success: res => {
							console.log(res);
							if (res.statusCode == 200) {
								this.handleTemplate(res.data.data.zones)
							} else if (res.statusCode == 401) {
								console.log('token失效')
								this.logout()
								this.loginTip = '登录失效'
							} else {
								const error = res.data.error
								if (error) {
									uni.showToast({
										icon: 'none',
										title: error,
										duration: 2000
									});
								}
							}
						},
						fail: () => {
							uni.showToast({
								icon: 'none',
								title: '网络请求失败',
								duration: 2000
							})
						}
					})
				}
			},
			handleTemplate(zones) {
				console.log(zones)
				// 筛选非系统的zone
				const roomZones = zones.map((zone) => new RoomZoneModel(zone)).filter((item) => !item.isSystemZone)
				this.roomZones = roomZones
				console.log(roomZones)
			},
			deviceItemClick(index) {
				console.log(index)
			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		background-color: #FAFAFA;
	}
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #F0F0F0;
	}
	.login-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 32rpx;
	}
	.login-button {
		background-color: $uni-color-stey;
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		flex-shrink: 1;
		border-radius: 8rpx;
		font-size: 14px;
		color: #FFFFFF;
		text-align: center;
		margin: 40rpx 180rpx;
	}
	.van-dropdown-menu {
		background-color: #FAFAFA !important;
		font-size: 20px !important;
		color: #000000 !important;
		font-weight: bold !important;
		height: 44px !important;
	}
	.zone-section-container {
		display: flex;
		flex-direction: column;
		padding: 0 32rpx;
	}
	.zone-section-title {
		color: #4A4A4A;
		font-size: 12px;
		font-weight: bold;
		height: 38px;
		line-height: 38px;
	}
	.grid-container {
		padding: 0 !important;
	}
	.grid-item-content {
		padding: 0 !important;
		color: transparent !important;
	}
	.zone-device-container {
		background-color: #DCDCDC;
		height: 164rpx;
		width: 100%;
		border-radius: 8rpx;
		display: flex;
		justify-content: space-between;
	}
	.device-left {
		display: flex;
		flex-direction: column;
	}
	.device-image {
		width: 60rpx;
		height: 60rpx;
		margin: 18rpx 0 10rpx 18rpx;
	}
	.state-text {
		color: #9B9B9B;
		font-size: 10px;
		margin-left: 24rpx;
	}
	.device-name {
		color: #000000;
		font-size: 12px;
		font-weight: bold;
		margin: 8rpx 0 0 24rpx;
	}
	.device-right {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-end;
	}
	.switch-color {
		width: 12rpx;
		height: 12rpx;
		border-radius: 6rpx;
		background-color: #9B9B9B;
		margin: 20rpx 20rpx 0 0;
	}
	.setting-image {
		width: 60rpx;
		height: 60rpx;
		margin: 0 8rpx 8rpx 0;
	}
	
</style>
