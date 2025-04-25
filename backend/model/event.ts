export default {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			description: "An event.",
			required: ["public", "organiserID"],
			properties: {
				_id: {},
				public: {
					bsonType: "bool",
					title: "Whether or not the event is public."
				},
				invitations: {
					bsonType: "array",
					title: "The invitations to the event.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "An invitation to the event."
					}
				},
				requests: {
					bsonType: "array",
					title: "The requests to join the event.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "A request to join the event."
					}
				},
				discussionBoard: {
					bsonType: "array",
					title: "The discussion board of the event.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "A message in the discussion board."
					}
				},
				notifications: {
					bsonType: "array",
					title: "Notifications for the event.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "A notification for the event."
					}
				},
				images: {
					bsonType: "objectId",
					title: "The image of the event."
				},
				organiserID: {
					bsonType: "objectId",
					title: "The event organiser"
				},
				eventName: {
					bsonType: "string",
					title: "The event name of the event."
				},
				eventLocation: {
					bsonType: "string",
					title: "The event location of the event."
				},
				eventDescription: {
					bsonType: "string",
					title: "The event description of the event."
				},
				eventTime: {
					bsonType: "date",
					title: "The time of the event."
				},
				joinedUsers: {
					bsonType: "array",
					title: "The joined users.",
					items: {
						bsonType: "objectId",
						title: "A joined user."
					}
				},
			},
			additionalProperties: false
		}
	}
}