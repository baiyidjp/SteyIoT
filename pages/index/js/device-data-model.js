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
		// 空调/新风机风速 off l1 l2 l3
		this.isLow = false
		this.isMid = false
		this.isHigh = false
		// 空调的温度
		this.acTemp = 26.0
		// 室内温度
		this.currentRoomTemp = 0
		// 新风机档位
		this.isAuto = false
		this.isManual = false
		this.isSleep = false
		this.aqi = '--'
		this.co2 = '--'
		this.pm25 = '--'
		
		switch (device.typeC) {
			// 单开关
			case 'onekeyswitch': 
			this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
			this.deviceShowTitle = this.isDeviceOn ? '已打开' : '已关闭'
			this.showDeviceSetting = false
			break;
			// 调控灯
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
			// 窗帘
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
			// 空调
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
			// 新风机
			case 'airpurifiercontrol':
			if (device.version == 1) {
				this.isDeviceOn = this.deviceControlModel(40).value === 'true' ? true : false
				// 数据
				const dataControlModel = this.deviceControlModel(20)
				if (dataControlModel.value) {
					const dataJSON = JSON.parse(dataControlModel.value)
					this.aqi = dataJSON.aqi || '--'
					this.co2 = dataJSON.co2 || '--'
					this.pm25 = dataJSON.pm25 || '--'
				}
				const controlModel = this.deviceControlModel(50)
				if (controlModel.value) {
					this.isAuto = (controlModel.value === '1')
					this.isManual = (controlModel.value === '0')
					this.isSleep = (controlModel.value === '2')
				}
				const windControlModel = this.deviceControlModel(70)
				if (windControlModel.value) {
					this.isLow = (windControlModel.value === '1')
					this.isMid = (windControlModel.value === '2')
					this.isHigh = (windControlModel.value === '3')
				}
			} else {
				this.isDeviceOn = this.deviceControlModel(10).value === 'true' ? true : false
				const controlModel = this.deviceControlModel(20)
				if (controlModel.value) {
					this.isAuto = (controlModel.value === 'auto')
					this.isManual = (controlModel.value === 'manual')
					this.isSleep = (controlModel.value === 'sleep')
				}
				const windControlModel = this.deviceControlModel(30)
				if (windControlModel.value) {
					this.isLow = (windControlModel.value === 'l1')
					this.isMid = (windControlModel.value === 'l2')
					this.isHigh = (windControlModel.value === 'l3')
				}
				this.aqi = this.deviceControlModel(1060).value || '--'
				this.co2 = this.deviceControlModel(1050).value || '--'
				this.pm25 = this.deviceControlModel(1010).value || '--'
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