<template>
	<view class="pop-device-dimmer-container">
		<view class="dimmer-value">{{ sliderValue }}%</view>
		<view class="pop-slider-container">
			<van-slider :value="sliderValue" bar-height="12px" active-color="#FFFFFF" inactive-color="#333333" @change="sliderValueChange" @drag-start="sliderDragStart" @drag-end="sliderDragEnd"/>
		</view>
	</view>
</template>

<script>
	import DeviceModel from '../js/device-model.js'
	import DeviceDataModel from '../js/device-data-model.js';
	export default {
		data() {
			return {
				sliderValue: 0,
				isDrag: false,
				isWatchDataChange: false
			}
		},
		props: {
			deviceDataModel: null
		},
		watch: {
			deviceDataModel: function(newValue, oldValue) {
				this.isWatchDataChange = true
				this.sliderValue = newValue.sliderValue
			}
		},
		mounted() {
			if (this.deviceDataModel) {
				this.sliderValue = this.deviceDataModel.sliderValue
			}
		},
		methods: {
			sliderValueChange(event) {
				this.sliderValue = event.detail
				if (!this.isDrag && !this.isWatchDataChange) {
					this.sliderDragEnd()
				}
			},
			sliderDragStart() {
				this.isDrag = true
			},
			sliderDragEnd() {
				this.isDrag = false
				this.isWatchDataChange = false
				if (!this.deviceDataModel.isDeviceOn) return
				let controlId = this.deviceControlModel(20).zoneDeviceControlId
				const obj = {
					'value': `${this.sliderValue}`,
					'zoneDeviceId': this.deviceDataModel.device.zoneDeviceId,
					'zoneDeviceControlId': controlId,
				}
				this.$emit('sendsocketobj', obj)
			},
			deviceControlModel(tag) {
				const controlModel = this.deviceDataModel.device.controls.filter((control) => control.tag == tag)[0]
				if (controlModel) {
					return controlModel
				}
				return null
			}
		}
	}
</script>

<style>
	.pop-device-dimmer-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.dimmer-value {
		background-color: #FFFFFF;
		width: 80rpx;
		height: 48rpx;
		border-radius: 10rpx;
		color: #000000;
		font-size: 12px;
		margin-bottom: 20rpx;
		text-align: center;
		line-height: 48rpx;
	}
	.pop-slider-container {
		width: 90%;
	}
</style>
