import DeviceModel from './device-model.js'

class RoomZoneModel {
	constructor(obj) {
		this.zoneId = obj.id
		this.templateId = obj.templateId
		this.isSystemZone = obj.isSystemZone
		this.zoneName = obj.nameT[0].content
		this.devices = obj.devices.map((device) => new DeviceModel(device))
	}
}

export default RoomZoneModel