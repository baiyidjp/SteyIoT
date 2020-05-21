<template>
	<view class="container">
		<view v-if="isLogin">
			<view class="space-container">当前房间: {{ currentRoomName }}</view>
			<view class="zone-section-container" v-for="(zone, zoneIndex) in roomZones" :key="zone.zoneId">
				<view class="zone-section-title">{{ zone.zoneName }}</view>
				<uni-grid :column="2" :show-border="false"  :square="false">
					<uni-grid-item v-for="(device, deviceIndex) in zone.devices" :key="device.zoneDeviceId">
						<view class="zone-device-container" :class="{'zone-device-margin': deviceIndex % 2 == 0}">{{ device.deviceName }}</view>
					</uni-grid-item>
				</uni-grid>
			</view>
		</view>
		<view v-else class="login-container">
			<view>当前未登录</view>
			<view class="login-button" @click="loginButtonClick">点我登录</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import SpaceModel from './space-model.js'
	import RoomZoneModel from './room-zone.js'
	export default {
		data() {
			return {
				spaces: [],
				currentSpace: null,
				currentRoomName: '',
				roomZones: []
			}
		},
		onShow() {
			if (this.isLogin) {
				this.requestAppInfo()
			}
		},
		methods: {
			loginButtonClick() {
				uni.navigateTo({
					url:'../login/login'
				})
			},
			requestAppInfo() {
				// 请求AppInfo信息
				uni.request({
					url: 'https://uat-gateway.stey.com/iot-service/app/app-info',
					method: 'GET',
					data: {},
					header: {
						'Content-Type': 'application/json; charset=utf-8',
						'Authorization': `Bearer ${uni.getStorageSync('token')}`,
						'Accept-Language': 'zh'
					},
					success: res => {
						if (res.statusCode == 200) {
							this.handleAppInfo(res.data.data)
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
					fail: () => {},
					complete: () => {}
				})
			},
			handleAppInfo(data) {
				this.spaces = data.accessibleSpaces.map((obj) => new SpaceModel(obj))
				if (this.spaces.length > 0) {
					this.currentSpace = this.spaces[0]
					this.currentRoomName = this.currentSpace.roonName
					this.requestIoTTemplate()
				}
			},
			requestIoTTemplate() {
				if (this.currentSpace) {
					uni.request({
						url: `https://uat-gateway.stey.com/iot-service/app/iot/template/${this.currentSpace.spaceId}`,
						method: 'GET',
						data: {},
						header: {
							'Content-Type': 'application/json; charset=utf-8',
							'Authorization': `Bearer ${uni.getStorageSync('token')}`,
							'Accept-Language': 'zh'
						},
						success: res => {
							if (res.statusCode == 200) {
								this.handleTemplate(res.data.data.zones)
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
						fail: () => {},
						complete: () => {}
					})
				}
			},
			handleTemplate(zones) {
				console.log(zones)
				// 筛选非系统的zone
				const roomZones = zones.map((zone) => new RoomZoneModel(zone)).filter((item) => !item.isSystemZone)
				this.roomZones = roomZones
				console.log(roomZones)
			}
		},
		computed: {
			...mapState(['isLogin'])
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
	}
	.container {
		height: 100%;
		padding: 32rpx;
		display: flex;
		flex-direction: column;
		background-color: #F0F0F0;
	}
	.login-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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
	.space-container {
		font-size: 20px;
		color: #000000;
		font-weight: bold;
		margin-bottom: 32rpx;
		text-align: center;
	}
	.zone-section-container {
		display: flex;
		flex-direction: column;
	}
	.zone-section-title {
		color: #4A4A4A;
		font-size: 12px;
		font-weight: bold;
		height: 38px;
		line-height: 38px;
	}
	.zone-device-container {
		background-color: #DCDCDC;
		height: 164rpx;
	}
	.zone-device-margin {
		margin-right: 12rpx;
	}
</style>
