<template>
	<view class="zone-device-container" :style="{backgroundColor: deviceBackgroundColor}" @click="deviceItemClick">
		<view class="device-left">
			<image class="device-image" :src="deviceImage" mode=""></image>
			<text class="state-text" :style="{color: switchColor}">{{ deviceTitle }}</text>
			<text class="device-name">{{ deviceName }}</text>
		</view>
		<view v-if="deviceDataModel.showDeviceSwitchColor" class="device-right">
			<view class="switch-color" :style="{backgroundColor: switchColor}"></view>
			<image v-if="deviceDataModel.showDeviceSetting" class="setting-image" src="/static/images/icon_settings.png" @click.stop="settingButtonClick"></image>
		</view>
		<view v-else class="device-right-setting">
			<image class="setting-image" src="/static/images/icon_settings.png" @click.stop="settingButtonClick"></image>
		</view>
	</view>
</template>

<script>
	import DeviceModel from '../js/device-model.js'
	import DeviceDataModel from '../js/device-data-model.js';
	export default {
		data() {
			return {
			}
		},
		props: {
			deviceDataModel: null
		},
		computed: {
			deviceImage() {
				return `/static/images/${this.deviceDataModel.deviceImageName}`
			},
			deviceBackgroundColor() {
				return this.deviceDataModel.isDeviceOn ? '#FFFFFF' : '#DCDCDC'
			},
			switchColor() {
				return this.deviceDataModel.isDeviceOn ? '#F5BB23' : '#9B9B9B'
			},
			deviceTitle() {
				return this.deviceDataModel.deviceShowTitle
			},
			deviceName() {
				return this.deviceDataModel.device.deviceName
			}
		},
		methods: {
			deviceItemClick() {
				let controlId = this.deviceControlModel(10).zoneDeviceControlId
				if (this.deviceDataModel.device.typeC === 'airpurifiercontrol' && this.deviceDataModel.device.version === 1) {
					controlId = this.deviceControlModel(40).zoneDeviceControlId	
				}
				const obj = {
					'value': this.deviceDataModel.isDeviceOn ? 'false' : 'true',
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlId,
				}
				this.$emit('itemclick', obj)
			},
			settingButtonClick() {
				this.$emit('settingclick', this.deviceDataModel)
			},
			deviceControlModel(tag) {
				const controlModel = this.deviceDataModel.device.controls.filter((control) => control.tag == tag)[0]
				if (controlModel) {
					return controlModel
				}
				return new DeviceControlModel()
			}
		},
	}
</script>

<style lang="scss">
	.zone-device-container {
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
		font-size: 10px;
		margin-left: 24rpx;
		height: 14px;
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
	.device-right-setting {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	.switch-color {
		width: 12rpx;
		height: 12rpx;
		border-radius: 6rpx;
		margin: 20rpx 20rpx 0 0;
	}
	.setting-image {
		width: 60rpx;
		height: 60rpx;
		margin: 0 8rpx 8rpx 0;
	}
</style>
