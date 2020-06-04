<template>
	<view class="curtain-container">
		<view class="item" :class="isOpen ? 'item-active' : 'item-normal'" @click="openButtonClick">开</view>
		<view class="item pause-container" :class="isPause ? 'item-active' : 'item-normal'" @click="pauseButtonClick">暂停</view>
		<view class="item" :class="isClose ? 'item-active' : 'item-normal'" @click="closeButtonClick">关</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isOpen: false,
				isPause: false,
				isClose: false
			}
		},
		props: {
			deviceDataModel: null
		},
		watch: {
			deviceDataModel: function(newValue, oldValue) {
				this.isOpen = newValue.isOpen
				this.isPause = newValue.isPause
				this.isClose = newValue.isClose
			}
		},
		mounted() {
			if (this.deviceDataModel) {
				this.isOpen = this.deviceDataModel.isOpen
				this.isPause = this.deviceDataModel.isPause
				this.isClose = this.deviceDataModel.isClose
			}
		},
		methods: {
			openButtonClick() {
				this.isOpen = true
				this.isPause = false
				this.isClose = false
				this.sendSocketObj(10)
			},
			pauseButtonClick() {
				if (this.isOpen || this.isClose) {
					this.isOpen = false
					this.isPause = true
					this.isClose = false
					this.sendSocketObj(20)
				}
			},
			closeButtonClick() {
				this.isOpen = false
				this.isPause = false
				this.isClose = true
				this.sendSocketObj(30)
			},
			sendSocketObj(tag) {
				const controlId = this.deviceControlModel(tag).zoneDeviceControlId
				const obj = {
					'value': 'true',
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
		},
	}
</script>

<style>
	.curtain-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.item {
		width: 100px;
		height: 50px;
		text-align: center;
		line-height: 50px;
		border: 2px #FFFFFF solid;
		border-radius: 5px;
	}
	.pause-container {
		margin: 20px 0;
	}
	.item-active {
		background-color: #FFFFFF;
		color: #4A4A4A;
	}
	.item-normal {
		color: #FFFFFF;
	}
</style>
