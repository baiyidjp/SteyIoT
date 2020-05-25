import DeviceModel from './device-model.js'
import DeviceControlModel from './control-model.js'

class DeviceDataModel {
	constructor(device) {
		this.device = device
		this.showDeviceSwitchColor = true
		this.showDeviceSetting = false
		switch (device.typeC) {
			case 'onekeyswitch': 
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false,
			this.deviceShowTitle = this.isDeviceOn ? '已打开' : '已关闭',
			this.showDeviceSetting = false
			break;
			case 'dimmingcontrol':
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false,
			this.deviceShowTitle = this.isDeviceOn ? this.deviceControlModel(20).value : '已关闭'
			break;
			case 'curtaincontrol':
			const openControlModel = this.deviceControlModel(10)
			const pauseControlModel = this.deviceControlModel(20)
			const closeControlModel = this.deviceControlModel(30)
		
			const isOpen = openControlModel.value
			const isPause = pauseControlModel.value
			const isClose = closeControlModel.value
		
			if (isOpen || isClose || isPause) {
					this.isDeviceOn = true
			} else {
					this.isDeviceOn = false
			}
			this.deviceShowTitle = ''
			this.showDeviceSwitchColor = false
			break;
			case 'airconditionercontrol':
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
			let title = '制冷'
			// 空调温度
			const acTemp = this.deviceControlModel(40).value
			if (acTemp) {
				title = '制冷' + ' / ' + acTemp
			}
			this.deviceShowTitle = this.isDeviceOn ? title : '已关闭'
			break;
			case 'airpurifiercontrol':
			if (device.version == 1) {
				this.isDeviceOn = this.deviceControlModel(40).value === 'true' ? true : false
			} else {
				this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
			}
			this.deviceShowTitle = this.isDeviceOn ? '已打开' : '已关闭'
			break;
		}
		let iconC = device.iconC
		if (iconC.indexOf('lamp') != -1) {
				iconC = 'ceilinglamp'
		}
		const switchState = this.isDeviceOn ? 'on' : 'off'
		this.deviceImageName = `stey_ioticon_${switchState}_${iconC}.png`
	}
	
	deviceControlModel(tag) {
		const controlModel = this.device.controls.filter((control) => control.tag == tag)[0]
		if (controlModel) {
			return controlModel
		}
		return new DeviceControlModel()
	}
}

export default DeviceDataModel