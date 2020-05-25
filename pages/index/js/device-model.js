import DeviceControlModel from './control-model.js'

class DeviceModel {
	constructor(obj) {
		this.zoneDeviceId = obj.id
		this.isVisible = obj.isVisible
		this.deviceName = obj.nameT[0].content
		this.typeC = obj.typeC
		this.version = obj.version
		this.iconC = obj.iconC
		this.isConfigurable = obj.isConfigurable
		this.controls = obj.controls.map((control) => new DeviceControlModel(control))
	}
}

export default DeviceModel