class DeviceControlModel {
	constructor(obj) {
	  this.zoneDeviceControlId = obj.id
		this.code = obj.code
		this.typeC = obj.typeC
		this.value = obj.value
		this.controlName = obj.nameT[0].content || ''
		this.tag = obj.tag
		this.zoneDeviceId = obj.zoneDeviceId
		this.valueBound = obj.valueBound
		if (obj.valueBound) {
			const valueBound = obj.valueBound
			const values = valueBound.split('-')
			if (values.length === 2) {
				this.minValue = parseFloat(values[0])
				this.maxValue = parseFloat(values[1])
			}
		} else {
			this.minValue = Number.MIN_SAFE_INTEGER
			this.maxValue = Number.MAX_SAFE_INTEGER
		}
	}
}

export default DeviceControlModel