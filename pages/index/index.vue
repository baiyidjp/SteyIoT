<template>
	<view class="container" :style="{paddingBottom: bottomArea + 'px'}">
		<block v-if="isLogin">
			<block v-if="roomNameValues.length > 0">
				<view class="van-dropdowm-container" :style="{paddingTop: statusBarHeight + 'px'}">
					<van-dropdown-menu active-color="#5a2b81">
						<van-dropdown-item :value="currentRoomValue" :options="roomNameValues" @change="tapCurrentRoom"></van-dropdown-item>
					</van-dropdown-menu>
				</view>
				<view :style="{marginTop: navigationBarHeight + 'px'}">
					<view class="zone-section-container" v-for="(zone, zoneIndex) in roomZones" :key="zone.zoneId">
						<view class="zone-section-title">{{ zone.zoneName }}</view>
						<van-grid :column-num="gridColumn" gutter="6px" custom-class="grid-container">
							<van-grid-item use-slot content-class="grid-item-content" v-for="(deviceDataModel, deviceIndex) in zone.deviceDataModels" :key="deviceDataModel.device.zoneDeviceId">
								<device-item style="width: 100%;" :deviceDataModel="deviceDataModel" @sendsocketobj="sendSocketObj" @settingclick="deviceSettingClick()"></device-item>
							</van-grid-item>
						</van-grid>
					</view>
				</view>
			</block>
			<view v-else v-show="isRequestSpacesDone" class="login-container">
				<view>暂无订单</view>
				<view class="login-button" @click="bookingButtonClick">点我预定</view>
				<view class="login-button" @click="changeAccountButtonClick">切换账号</view>
			</view>
		</block>
		<van-popup :show="showPop">
			<view class="pop-back">
				<view class="pop-top">
					<view class="pop-close" :style="{marginTop: (statusBarHeight + 10) + 'px'}">
						<van-icon name="close" size="32px" color="#FFFFFF" @click="popUpClose"/>
					</view>
					<image class="pop-device-image" :src="popDeviceImage" mode=""></image>
				</view>
				<view class="pop-middle">
					<device-dimmer-setting v-if="deviceType.isDimmer" :deviceDataModel="currentDeviceDataModel" @sendsocketobj="sendSocketObj"></device-dimmer-setting>
					<device-curtain-setting v-if="deviceType.isCurtain" :deviceDataModel="currentDeviceDataModel" @sendsocketobj="sendSocketObj"></device-curtain-setting>
					<device-air-conditioner-setting v-if="deviceType.isAirConditioner" :deviceDataModel="currentDeviceDataModel" @sendsocketobj="sendSocketObj"></device-air-conditioner-setting>
					<device-air-purifier-setting v-if="deviceType.isAirPurification" :deviceDataModel="currentDeviceDataModel" @sendsocketobj="sendSocketObj"></device-air-purifier-setting>
				</view>
				<view class="pop-bottom">
					<image v-if="showSwitchImage" class="switch-button" :src="switchImage" mode="" @click="switchButtonClick"></image>
					<view class="device-name">{{ deviceName }}</view>
					<view v-if="showSwitchImage" class="switch-state">{{ switchState }}</view>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import SpaceModel from './js/space-model.js'
	import RoomZoneModel from './js/room-zone.js'
	import SocketModel from './js/socket-model.js'
	import DeviceItem from './components/device-item.vue'
	import DeviceDimmerSetting from './components/device-dimmer-setting.vue'
	import DeviceCurtainSetting from './components/device-curtain-setting.vue'
	import DeviceAirConditionerSetting from './components/device-air-conditioner-setting.vue'
	import DeviceAirPurifierSetting from './components/device-air-purifier-setting.vue'
	
	export default {
		data() {
			return {
				statusBarHeight: 20,
				navigationBarHeight: 64,
				bottomArea: 6,
				loginTip: '当前未登录',
				gridColumn: 2,
				roomNameValues: [],
				currentRoomValue: null,
				roomZones: [],
				isWebSocketOpen: false,
				isRequestSpacesDone: false,
				currentDeviceDataModel: null,
				showPop: false,
				deviceType: {
					isDimmer: false,
					isCurtain: false,
					isAirConditioner: false,
					isAirPurification: false
				}
			}
		},
		components: {
			DeviceItem,
			DeviceDimmerSetting,
			DeviceCurtainSetting,
			DeviceAirConditionerSetting,
			DeviceAirPurifierSetting
		},
		onLoad() {
			// 计算
			this.statusBarHeight = getApp().globalData.statusBarHeight
			this.navigationBarHeight = getApp().globalData.navigationBarHeight
			this.bottomArea = getApp().globalData.bottomArea > 0 ? getApp().globalData.bottomArea : 6
			// 接收全局登录事件
			uni.$on('haveLogin', () => {
				this.requestAccessibleSpaces()
			})
			// 获取房间
			if (this.isLogin) {
				this.requestAccessibleSpaces()
			} else {
				this.gotoLoginPage()
			}
			// websocket 回调
			uni.onSocketOpen(() => {
				this.isWebSocketOpen = true
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
			uni.onSocketClose((res) => {
				this.isWebSocketOpen = false
			  console.log('WebSocket 已关闭！', res);
				if (res.code === 1006) {
					// 自动断 重新连
					this.connectSocket()
				}
			})
		},
		onShow() {
			if (this.isLogin && this.currentRoomValue) {
				this.connectSocket()
			}
		},
		onHide() {
			uni.closeSocket()
		},
		computed: {
			...mapState(['isLogin']),
			popDeviceImage() {
				if (this.currentDeviceDataModel) {
					switch (this.currentDeviceDataModel.device.typeC) {
						case 'dimmingcontrol':
						return '../../static/images/stey_ioticon_editceilinglamp.png'
						break;
						case 'curtaincontrol':
						return '../../static/images/stey_ioticon_editcurtain.png'
						break;
						case 'airconditionercontrol':
						return '../../static/images/stey_ioticon_editairconditioner.png'
						break;
						case 'airpurifiercontrol':
						return '../../static/images/stey_ioticon_editairquality.png'
						break;
					}
				} 
				return ''
			},
			showSwitchImage() {
				if (this.currentDeviceDataModel) {
					return this.currentDeviceDataModel.device.typeC !== 'curtaincontrol'
				}
				return false
			},
			switchImage() {
				if (this.currentDeviceDataModel) {
					return this.currentDeviceDataModel.isDeviceOn ? '../../static/images/stey_ioticon_switch_on.png' : '../../static/images/stey_ioticon_switch_off.png'
				}
				return ''
			},
			deviceName() {
				if (this.currentDeviceDataModel) {
					return this.currentDeviceDataModel.device.deviceName
				}
				return ''
			},
			switchState() {
				if (this.currentDeviceDataModel) {
					return this.currentDeviceDataModel.isDeviceOn ? '已打开' : '已关闭'
				}
				return ''
			}
		},
		methods: {
			...mapMutations(['logout']),
			gotoLoginPage() {
				console.log('toLogin');
				this.logout()
				uni.redirectTo({
					url:'../login/login'
				})
			},
			tokenInvaild() {
				this.gotoLoginPage()
				uni.showToast({
					icon: 'none',
					title: '登录失效,重新登录',
					duration: 2000
				});
			},
			showErrorMessage(error) {
				uni.showToast({
					icon: 'none',
					title: error,
					duration: 2000
				});
			},
			showRequestFailed() {
				uni.showToast({
					icon: 'none',
					title: '网络请求失败',
					duration: 2000
				})
			},
			bookingButtonClick() {
				const url = encodeURIComponent('https://www.stey.com/zh-CN/booking/list')
				uni.navigateTo({
					url: `../web/web-view?url=${url}`
				})
			},
			changeAccountButtonClick() {
				this.gotoLoginPage()
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
							this.tokenInvaild()
						} else {
							const error = res.data.error
							if (error) {
								this.showErrorMessage()
							}
						}
					},
					fail: () => {
						this.showRequestFailed()
					},
					complete: () => {
						this.isRequestSpacesDone = true
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
				}
			},
			requestIoTTemplate() {
				if (this.currentRoomValue) {
					uni.showLoading({
						title:'',
						mask: true
					})
					uni.request({
						url: `https://gateway.stey.com/iot-service/app/iot/template/${this.currentRoomValue}`,
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
								this.tokenInvaild()
							} else {
								const error = res.data.error
								if (error) {
									this.showErrorMessage()
								}
							}
						},
						fail: () => {
							this.showRequestFailed()
						},
						complete() {
							uni.hideLoading()
						}
					})
				}
			},
			handleTemplate(zones) {
				// 筛选非系统的zone
				const roomZones = zones.map((zone) => new RoomZoneModel(zone)).filter((item) => !item.isSystemZone)
				this.roomZones = roomZones
				//打开websocket
				this.connectSocket()
			},
			connectSocket() {
				if (this.isWebSocketOpen) {
					uni.closeSocket()
				}
				uni.connectSocket({
					url: `wss://gateway.stey.com/iot-service/app/iot/connect/${this.currentRoomValue}`,
				})
			},
			handleSocketMeesage(data) {
				const obj = JSON.parse(data)
				const socketModel = new SocketModel(obj)
				this.roomZones.forEach((zone) => {
					const deviceDataModel = zone.deviceDataModels.filter((deviceDataModel) => deviceDataModel.device.zoneDeviceId === socketModel.zoneDeviceId)[0]
					if (deviceDataModel) {
						const deviceModel = deviceDataModel.device
						const controlModel = deviceModel.controls.filter((control) => control.zoneDeviceControlId === socketModel.zoneDeviceControlId)[0]
						if (controlModel) {
							controlModel.value = socketModel.value
							deviceDataModel.setDevice(deviceModel)
							if (this.currentDeviceDataModel && this.currentDeviceDataModel.device.zoneDeviceId === deviceModel.zoneDeviceId) {
								this.currentDeviceDataModel = deviceDataModel
							}
							// console.log(socketModel);
						}
					}
				})
			},
			deviceSettingClick(deviceDataModel) {
				this.currentDeviceDataModel = deviceDataModel
				this.deviceType.isDimmer = (deviceDataModel.device.typeC === 'dimmingcontrol')
				this.deviceType.isCurtain = (deviceDataModel.device.typeC === 'curtaincontrol')
				this.deviceType.isAirConditioner = (deviceDataModel.device.typeC === 'airconditionercontrol')
				this.deviceType.isAirPurification = (deviceDataModel.device.typeC === 'airpurifiercontrol')
				this.showPop = true
			},
			switchButtonClick() {
				let controlId = this.deviceControlModel(10).zoneDeviceControlId
				if (this.currentDeviceDataModel.device.typeC === 'airpurifiercontrol' && this.currentDeviceDataModel.device.version === 1) {
					controlId = this.deviceControlModel(40).zoneDeviceControlId	
				}
				let socketObj = {
					'spaceId': this.currentRoomValue,
					'value': this.currentDeviceDataModel.isDeviceOn ? 'false' : 'true',
					'zoneDeviceId': this.currentDeviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlId,
				}
				this.sendSocket(socketObj).then((res) => {
					this.currentDeviceDataModel.isDeviceOn = !this.currentDeviceDataModel.isDeviceOn
				})
			},
			popUpClose() {
				this.showPop = false
			},
			sendSocketObj(obj) {
				let socketObj = {
					'spaceId': this.currentRoomValue,
					...obj
				}
				this.sendSocket(socketObj)
			},
			sendSocket(socketObj) {
				console.log(socketObj);
				return new Promise((resolve, reject) => {
					// 震动
					uni.vibrateShort()
					uni.showLoading({
						title: '发送中',
						mask: true
					})
					uni.request({
						url: 'https://gateway.stey.com/iot-service/app/iot/run-command',
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
							if (res.statusCode == 200) {
								resolve(res)
							} else if (res.statusCode == 401) {
								this.tokenInvaild()
							} else {
								const error = res.data.error
								if (error) {
									this.showErrorMessage()
								}
							}
						},
						fail: () => {
							this.showRequestFailed()
						},
						complete() {
							uni.hideLoading()
						}
					})
				})
			},
			deviceControlModel(tag) {
				const controlModel = this.currentDeviceDataModel.device.controls.filter((control) => control.tag == tag)[0]
				if (controlModel) {
					return controlModel
				}
				return new DeviceControlModel()
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
	.van-popup {
		background-color: rgba(0, 0, 0, .5) !important;
		height: 100%;
		width: 100%;
		backdrop-filter: blur(5px);
	}
	.pop-back {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.pop-top {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.pop-close {
		margin-left: 60rpx;
		align-self: flex-start;
	}
	.pop-device-image {
		width: 60px;
		height: 60px;
	}
	.pop-middle {
		width: 100%;
		flex: 1;
	}
	.pop-bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #FFFFFF;
		font-size: 12px;
		padding-bottom: 120rpx;
	}
	.switch-button {
		width: 60px;
		height: 60px;
	}
	.device-name {
		margin: 8rpx 0;
	}
</style>
