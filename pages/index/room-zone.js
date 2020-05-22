class RoomZoneModel {
	constructor(obj) {
		this.zoneId = obj.id
		this.templateId = obj.templateId
		this.isSystemZone = obj.isSystemZone
		this.zoneName = obj.nameT[0].content
		this.devices = obj.devices.map((device) => new DeviceModel(device))
	}
}

class DeviceModel {
	constructor(obj) {
		this.zoneDeviceId = obj.id
	  this.zoneId = obj.zoneId
		this.deviceId = obj.deviceId
		this.isVisible = obj.isVisible
		this.deviceName = obj.nameT[0].content
		this.typeC = obj.typeC
		this.version = obj.version
		this.zoneId = obj.zoneId
		this.iconC = obj.iconC
		this.controls = obj.controls.map((control) => new DeviceControlModel(control))
	}
}

class DeviceControlModel {
	constructor(obj) {
	  this.zoneDeviceControlId = obj.id
	}
}

export default RoomZoneModel