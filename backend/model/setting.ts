export default {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			description: 'Global setting for website',
			required: ['eventLimit', 'invitationLimit'],
			properties: {
				_id: {},
				eventLimit: {
					bsonType: "int",
					title: "The maximum amount of events a user can create",
				},
				invitationLimit: {
					bsonType: "int",
					title: "The maximum number of invitations an event can send",
				}
			},
			additionalProperties: false
		}
	}
}