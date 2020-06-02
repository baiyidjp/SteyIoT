<template>
	<view class="purifier-container">
		<view class="top-tip">室内空气质量</view>
		<view class="middle-container">
			<view class="middle-item">
				<view class="item-data-text">{{ currentPM25 }}</view>
				<view class="item-tip-text">PM2.5</view>
			</view>
			<view class="middle-item">
				<view class="item-data-text">{{ currentCO2 }}</view>
				<view class="item-tip-text">CO2/ppm</view>
			</view>
		</view>
		<view class="bottom-container">
			<view class="control-button-container">
				<view class="control-item" :class="{'control-item-selected': deviceDataModel.isAuto}" @click="autoButtonClick">
					<image class="control-item-image" :src="autoBackgroundImage" mode=""></image>
					<view class="control-item-text">自动</view>
				</view>
				<view class="control-item" :class="{'control-item-selected': deviceDataModel.isManual}" @click="manualButtonClick">
					<image class="control-item-image" :src="manualBackgroundImage" mode=""></image>
					<view class="control-item-text">手动</view>
				</view>
				<view class="control-item" :class="{'control-item-selected': deviceDataModel.isSleep}" @click="sleepButtonClick">
					<image class="control-item-image" :src="sleepBackgroundImage" mode=""></image>
					<view class="control-item-text">睡眠</view>
				</view>
			</view>
			<view class="wind-button-container">
				<image class="wind-button" :src="lowWindImage" mode="" @click="windL1ButtonClick"></image>
				<image class="wind-button" :src="midWindImage" mode="" @click="windL2ButtonClick"></image>
				<image class="wind-button" :src="highWindImage" mode="" @click="windL3ButtonClick"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import DeviceModel from '../js/device-model.js'
	import DeviceDataModel from '../js/device-data-model.js';
	export default {
		data() {
			return {
				currentPM25: '--',
				currentCO2: '--'
			}
		},
		props: {
			deviceDataModel: null
		},
		mounted() {
			if (this.deviceDataModel) {
				this.currentPM25 = this.deviceDataModel.pm25
				this.currentCO2 = this.deviceDataModel.co2
			}
		},
		watch: {
			deviceDataModel: function(newValue, oldValue) {
				this.currentPM25 = newValue.pm25
				this.currentCO2 = newValue.co2
			}
		},
		computed: {
			autoBackgroundImage() {
				if (this.deviceDataModel) {
					const isAuto = this.deviceDataModel.isAuto ? 'on' : 'off'
					return `../../../static/images/stey_ioticon_wind_auto_${isAuto}.png`
				}
				return''
			},
			manualBackgroundImage() {
				if (this.deviceDataModel) {
					const isManual = this.deviceDataModel.isManual ? 'on' : 'off'
					return `../../../static/images/stey_ioticon_wind_auto_${isManual}.png`
				}
				return''
			},
			sleepBackgroundImage() {
				if (this.deviceDataModel) {
					const isSleep = this.deviceDataModel.isSleep ? 'on' : 'off'
					return `../../../static/images/stey_ioticon_wind_auto_${isSleep}.png`
				}
				return''
			},
			lowWindImage() {
				if (this.deviceDataModel) {
					const isLow = this.deviceDataModel.isLow ? 'on' : 'off'
					return `../../../static/images/stey_ioticon_wind_low_${isLow}.png`
				}
				return ''
			},
			midWindImage() {
				if (this.deviceDataModel) {
					const isMid = this.deviceDataModel.isMid ? 'on' : 'off'
					return `../../../static/images/stey_ioticon_wind_middle_${isMid}.png`
				}
				return ''
			},
			highWindImage() {
				if (this.deviceDataModel) {
					const isHigh = this.deviceDataModel.isHigh ? 'on' : 'off'
					return `../../../static/images/stey_ioticon_wind_high_${isHigh}.png`
				}
				return ''
			},
		},
		methods: {
			autoButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				if (this.deviceDataModel.isAuto) return
				let controlModel = this.deviceControlModel(50)
				let value = '1'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(20)
					value = 'auto'
				}
				const obj = {
					'value': value,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				console.log(obj);
				this.$emit('sendsocketobj', obj)
				this.windL0ButtonClick()
			},
			manualButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				if (this.deviceDataModel.isManual) return
				let controlModel = this.deviceControlModel(50)
				let value = '0'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(20)
					value = 'manual'
				}
				const obj = {
					'value': value,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				this.$emit('sendsocketobj', obj)
			},
			sleepButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				if (this.deviceDataModel.isSleep) return
				let controlModel = this.deviceControlModel(50)
				let value = '2'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(20)
					value = 'sleep'
				}
				const obj = {
					'value': value,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				this.$emit('sendsocketobj', obj)
				this.windL0ButtonClick()
			},
			windL0ButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				let controlModel = this.deviceControlModel(70)
				let leave = '0'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(30)
					leave = 'off'
				}
				const obj = {
					'value': leave,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				this.$emit('sendsocketobj', obj)
			},
			windL1ButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				if (this.deviceDataModel.isLow) return
				let controlModel = this.deviceControlModel(70)
				let leave = '1'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(30)
					leave = 'l1'
				}
				const obj = {
					'value': leave,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				this.$emit('sendsocketobj', obj)
				this.manualButtonClick()
			},
			windL2ButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				if (this.deviceDataModel.isMid) return
				let controlModel = this.deviceControlModel(70)
				let leave = '2'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(30)
					leave = 'l2'
				}
				const obj = {
					'value': leave,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				this.$emit('sendsocketobj', obj)
				this.manualButtonClick()
			},
			windL3ButtonClick() {
				if (!this.deviceDataModel.isDeviceOn) return
				if (this.deviceDataModel.isHigh) return
				let controlModel = this.deviceControlModel(70)
				let leave = '3'
				if (this.deviceDataModel.device.version == 2) {
					controlModel = this.deviceControlModel(30)
					leave = 'l3'
				}
				const obj = {
					'value': leave,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlModel.zoneDeviceControlId,
				}
				this.$emit('sendsocketobj', obj)
				this.manualButtonClick()
			},
			deviceControlModel(tag) {
				const controlModel = this.deviceDataModel.device.controls.filter((control) => control.tag == tag)[0]
				if (controlModel) {
					return controlModel
				}
				return null
			}
		},
	}
</script>

<style>
	.purifier-container {
		width: 100%;
		height: 100%;
		color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.top-tip {
		color: rgba(255, 255, 255, 0.7);
		font-size: 12px;
	}
	.middle-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(100% - 200rpx);
		padding: 20px 0 24px;
		border-bottom: 1px rgba(255, 255, 255, .2) solid;
	}
	.middle-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.middle-item:nth-of-type(1) {
		margin-right: 190rpx;
	}
	.item-data-text {
		font-size: 48px;
		font-weight: bold;
	}
	.item-tip-text {
		color: rgba(255, 255, 255, 0.7);
		font-size: 12px;
	}
	.bottom-container {
		display: flex;
		flex-direction: column;
	}
	.control-button-container {
		display: flex;
		margin-top: 32px;
		font-size: 9px;
		color: #FFFFFF;
		font-weight: bold;
	}
	.control-item {
		width: 48px;
		height: 48px;
		text-align: center;
		position: relative;
	}
	.control-item-image {
		width: 48px;
		height: 48px;
	}
	.control-item-text {
		position: absolute;
		top: 0;
		width: 48px;
		height: 48px;
		line-height: 48px;
	}
	.control-item:nth-of-type(2) {
		margin: 0 80rpx;
	}
	.control-item-selected {
		color: #4A4A4A;
	}
	.wind-button-container {
		margin-top: 24px;
		display: flex;
	}
	.wind-button {
		width: 48px;
		height: 48px;
	}
	.wind-button:nth-of-type(2) {
		margin: 0 80rpx;
	}
</style>
