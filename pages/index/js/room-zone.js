import DeviceModel from './device-model.js'
import DeviceDataModel from './device-data-model.js';

class RoomZoneModel {
	constructor(obj) {
		this.zoneId = obj.id
		this.templateId = obj.templateId
		this.isSystemZone = obj.isSystemZone
		this.zoneName = obj.nameT[0].content
		this.devices = obj.devices.map((device) => new DeviceModel(device))
		this.deviceDataModels = this.devices.map((deviceModel) => new DeviceDataModel(deviceModel))
	}
}

export default RoomZoneModel