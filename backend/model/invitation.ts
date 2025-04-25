export default {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			title: "An invitation to an event.",
			required: ["receiverId", "state", "eventId"],
			properties: {
				_id: {},
				receiverId: {
					bsonType: "objectId",
					title: "The user invited to the event."
				},
				state: {
					bsonType: "string",
					enum: ["Accepted", "Not responded", "Declined"],
					title: "The current state of the invitation."
				},
				eventId: {
					bsonType: "objectId",
					title: "The event."
				}
			},
			additionalProperties: false
		}
	}
}
