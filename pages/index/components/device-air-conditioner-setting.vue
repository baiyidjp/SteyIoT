<template>
	<view class="conditioner-container">
		<view class="top-container">
			<image class="top-image" src="../../../static/images/stey_ioticon_wind_cold_on.png" mode=""></image>
			<view>当前空调模式统一设置为：制冷模式</view>
		</view>
		<view class="middle-container">
			<view class="temp-container">
				<image class="temp-button" src="../../../static/images/stey_ioticon_minus.png" mode="" @click="minusTempButtonClick"></image>
				<view class="temp-text">{{ currentTemp }}</view>
				<image class="temp-button" src="../../../static/images/stey_ioticon_plus.png" mode="" @click="plusTempButtonClick"></image>
			</view>
			<view class="current-temp-text">当前室内温度：{{ currentRoomTemp }}℃</view>
		</view>
		<view class="bottom-container">
			<image class="wind-button" :src="lowWindImage" mode=""></image>
			<image class="wind-button" :src="midWindImage" mode=""></image>
			<image class="wind-button" :src="highWindImage" mode=""></image>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTemp: 26.0,
				currentRoomTemp: 0
			}
		},
		props: {
			deviceDataModel: null
		},
		mounted() {
			if (this.deviceDataModel) {
				this.currentTemp = parseFloat(this.deviceDataModel.acTemp).toFixed(1)
				this.currentRoomTemp = this.deviceDataModel.currentRoomTemp
			}
		},
		watch: {
			deviceDataModel: function(newValue, oldValue) {
				this.currentTemp = newValue.acTemp
				this.currentRoomTemp = newValue.currentRoomTemp
			}
		},
		computed: {
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
			minusTempButtonClick() {
				this.currentTemp = (parseFloat(this.currentTemp) - 0.5).toFixed(1)
			},
			plusTempButtonClick() {
				this.currentTemp = (parseFloat(this.currentTemp) + 0.5).toFixed(1)
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

<style>
	.conditioner-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.top-container {
		display: flex;
		flex-direction: column;
		font-size: 12px;
		color: #FFFFFF;
		align-items: center;
	}
	.top-image {
		width: 48px;	
		height: 48px;
		margin-bottom: 16px;
	}
	.middle-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		border-top: 1px rgba(255, 255, 255, .2) solid;
		border-bottom: 1px rgba(255, 255, 255, .2) solid;
		margin: 16px 0 32px;
	}
	.temp-container {
		padding: 24px 0;
		font-size: 48px;
		color: #FFFFFF;
		font-weight: bold;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.temp-text {
		margin: 0 90rpx;
	}
	.temp-button {
		width: 40px;
		height: 40px;
	}
	.current-temp-text {
		font-size: 12px;
		color: #FFFFFF;
		padding-bottom: 16px;
	}
	.bottom-container {
		display: flex;
		justify-content: space-between;
	}
	.wind-button {
		width: 48px;
		height: 48px;
	}
	.wind-button:nth-of-type(2) {
		margin: 0 80rpx;
	}
</style>
