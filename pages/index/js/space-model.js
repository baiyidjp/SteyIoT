class SpaceModel {
	constructor(obj) {
		this.roomName = obj.nameT[0].content || '',
		this.spaceId = obj.spaceId
	}
}

export default SpaceModel