<template>
	<view class="container" :style="{paddingBottom: bottomArea}">
		<view v-if="isLogin">
			<view class="van-dropdowm-container" :style="{paddingTop: statusBarHeight}">
				<van-dropdown-menu active-color="#5a2b81" :z-index="dropdownMenuIndex">
					<van-dropdown-item :value="currentRoomValue" :options="roomNameValues" @change="tapCurrentRoom"></van-dropdown-item>
				</van-dropdown-menu>
			</view>
			<view :style="{marginTop: navigationBarHeight}">
				<view class="zone-section-container" v-for="(zone, zoneIndex) in roomZones" :key="zone.zoneId">
					<view class="zone-section-title">{{ zone.zoneName }}</view>
					<van-grid :column-num="gridColumn" gutter="6px" custom-class="grid-container">
						<van-grid-item use-slot content-class="grid-item-content" v-for="(device, deviceIndex) in zone.devices" :key="device.zoneDeviceId">
							<device-item style="width: 100%;" :device="device" @itemclick="deviceItemClick()"></device-item>
						</van-grid-item>
					</van-grid>
				</view>
			</view>
		</view>
		<view v-else class="login-container">
			<view>{{ loginTip }}</view>
			<view class="login-button" @click="loginButtonClick">点我登录</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import SpaceModel from './js/space-model.js'
	import RoomZoneModel from './js/room-zone.js'
	import SocketModel from './js/socket-model.js'
	import DeviceItem from './components/device-item.vue'
	export default {
		data() {
			return {
				statusBarHeight: '0px',
				navigationBarHeight: '0px',
				bottomArea: '6px',
				loginTip: '当前未登录',
				gridColumn: 2,
				roomNameValues: [],
				currentRoomValue: null,
				roomZones: []
			}
		},
		components: {
			DeviceItem
		},
		onLoad() {
			this.statusBarHeight = `${getApp().globalData.statusBarHeight}px`
			this.navigationBarHeight = `${getApp().globalData.navigationBarHeight}px`
			let bottomArea = getApp().globalData.bottomArea > 0 ? getApp().globalData.bottomArea : 6
			this.bottomArea = `${bottomArea}px`
			// websocket 回调
			uni.onSocketOpen(function(){
				console.log('WebSocket连接已打开！');
				// 向服务器发送token
				let data = {
					'data': {
						token: uni.getStorageSync('token')
					},
					'timestamp': Date.now()
				}
				uni.sendSocketMessage({
					data: JSON.stringify(data)
				})
			})
			uni.onSocketError(function(){
				console.log('WebSocket连接打开失败！');
			})
			uni.onSocketMessage((res) => {
				this.handleSocketMeesage(res.data)
			})
			uni.onSocketClose(function (res) {
			  console.log('WebSocket 已关闭！');
			})
		},
		onShow() {
			if (this.isLogin) {
				this.requestAccessibleSpaces()
			}
		},
		onHide() {
			uni.closeSocket()
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
			tapCurrentRoom(event) {
				this.currentRoomValue = event.detail
				this.requestIoTTemplate()
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
					this.currentRoomValue = 138
					this.roomNameValues = [
						{text: '520', value: 138},
						{text: '521', value: 142}
					]
					this.requestIoTTemplate()
				}
			},
			requestIoTTemplate() {
				if (this.currentRoomValue) {
					uni.showLoading({
						title:'',
						mask: true
					})
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
						},
						complete() {
							uni.hideLoading()
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
				//打开websocket
				this.connectSocket()
			},
			connectSocket() {
				uni.connectSocket({
					url: `wss://gateway.stey.com/iot-service/app/iot/connect/${this.currentRoomValue}`,
				})
			},
			handleSocketMeesage(data) {
				const obj = JSON.parse(data)
				const socketModel = new SocketModel(obj)
				this.roomZones.forEach((zone) => {
					const deviceModel = zone.devices.filter((device) => device.zoneDeviceId === socketModel.zoneDeviceId)[0]
					if (deviceModel) {
						const controlModel = deviceModel.controls.filter((control) => control.zoneDeviceControlId === socketModel.zoneDeviceControlId)[0]
						if (controlModel) {
							controlModel.value = socketModel.value
							console.log(socketModel);
						}
					}
				})
			},
			deviceItemClick(obj) {
				uni.showLoading({
					title: '发送中',
					mask: true
				})
				let socketObj = {
					'spaceId': this.currentRoomValue,
					...obj
				}
				uni.request({
					url: 'https://gateway.stey.com/iot-service/staff-app/iot/run-command',
					method: 'POST',
					data: {
						data: socketObj,
						timestamp: Date.now()
					},
					header: {
						'Content-Type': 'application/json; charset=utf-8',
						'Authorization': `Bearer ${uni.getStorageSync('token')}`,
						'Accept-Language': 'zh'
					},
					success: res => {
						console.log(res);
						if (res.statusCode == 200) {
							console.log(res.data)
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
					},
					complete() {
						uni.hideLoading()
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $uni-color-bgc;
	}
	.container {
		display: flex;
		flex-direction: column;
		background-color: $uni-color-bgc;
	}
	.login-container {
		margin-top: 300px;
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
		color: $uni-color-bgc;
		text-align: center;
		margin: 40rpx 180rpx;
	}
	.van-dropdowm-container {
		background-color: $uni-color-nav;
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		z-index: 99;
	}
	.van-dropdown-menu {
		background-color: $uni-color-nav !important;
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
		color: $uni-text-color;
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
	
</style>
