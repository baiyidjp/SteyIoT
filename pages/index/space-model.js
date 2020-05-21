class SpaceModel {
	constructor(obj) {
		this.roonName = obj.nameT[0].content || '',
		this.spaceId = obj.spaceId
	}
}

export default SpaceModel