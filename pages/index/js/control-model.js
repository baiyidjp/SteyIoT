class DeviceControlModel {
	constructor(obj) {
	  this.zoneDeviceControlId = obj.id
		this.code = obj.code
		this.typeC = obj.typeC
		this.value = obj.value
		this.controlName = obj.nameT[0].content || ''
		this.tag = obj.tag
		this.zoneDeviceId = obj.zoneDeviceId
		this.minValue = obj.minValue
		this.maxValue = obj.maxValue
		this.valueBound = obj.valueBound
	}
}

export default DeviceControlModel