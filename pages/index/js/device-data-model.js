import DeviceModel from './device-model.js'
import DeviceControlModel from './control-model.js'

class DeviceDataModel {
	constructor(device) {
		this.setDevice(device)
	}
	setDevice(device) {
		this.device = device
		this.showDeviceSwitchColor = true
		this.showDeviceSetting = true
		this.dimmerValue = 0
		// 滑块的值
		this.sliderValue = 0
		// 空调的风速 off l1 l2 l3
		this.isLow = false
		this.isMid = false
		this.isHigh = false
		// 空调的温度
		this.acTemp = 26.0
		// 室内温度
		this.currentRoomTemp = 0
		switch (device.typeC) {
			case 'onekeyswitch': 
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
			this.deviceShowTitle = this.isDeviceOn ? '已打开' : '已关闭'
			this.showDeviceSetting = false
			break;
			case 'dimmingcontrol':
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
			const sliderControlModel = this.deviceControlModel(20)
			const sliderValueFloat = sliderControlModel.value ? parseFloat(sliderControlModel.value) : sliderControlModel.minValue
			if (!sliderControlModel.value || sliderValueFloat < sliderControlModel.minValue) {
				sliderControlModel.value = `${sliderControlModel.minValue}`
			}
			if (sliderValueFloat > sliderControlModel.maxValue) {
				sliderControlModel.value = `${sliderControlModel.maxValue}`
			}
			const controlValue = sliderControlModel.value ? parseFloat(sliderControlModel.value) : sliderControlModel.minValue
			const sliderValue = (controlValue - sliderControlModel.minValue) / (sliderControlModel.maxValue - sliderControlModel.minValue)
			const valueInt = parseInt(sliderValue*100)
			const sliderValueInt = parseInt(this.dimmerValue*100)
			let showTitle = `${valueInt}%`
			this.sliderValue = valueInt
			if (Math.abs(sliderValueInt - valueInt) <= 4) {
				showTitle = `${sliderValueInt}%`
				this.sliderValue = sliderValueInt
			}
			this.deviceShowTitle = this.isDeviceOn ? showTitle : '已关闭'
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
			this.deviceShowTitle = ' '
			this.showDeviceSwitchColor = false
			break;
			case 'airconditionercontrol':
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
			let title = '制冷'
			// 空调温度
			const acTemp = this.deviceControlModel(40).value
			if (acTemp) {
				title = '制冷' + ' / ' + acTemp
				this.acTemp = acTemp
			}
			this.deviceShowTitle = this.isDeviceOn ? title : '已关闭'
			
			const windValue = this.deviceControlModel(30).value
			// 风速
			this.isLow = (windValue === 'l1')
			this.isMid = (windValue === 'l2')
			this.isHigh = (windValue === 'l3')

			// 室内温度
			let indoorTemp = this.deviceControlModel(1010).value
			if (indoorTemp) {
					this.currentRoomTemp = indoorTemp
			}
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
		let iconC = device.iconC ?? ''
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