export default {
	validator: {
		$jsonSchema: {
			bsonType: "object",
			title: "A user.",
			required: ["username", "password", "emailAddress"],
			properties: {
				_id: {},
				username: {
					bsonType: "string",
					title: "The username of a user."
				},
				password: {
					bsonType: "string",
					title: "The hashed password of a user."
				},
				emailAddress: {
					bsonType: "string",
					title: "The email address of a user."
				},
				notifications: {
					bsonType: "array",
					title: "The notifications the user has received.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "One of the notification(s) the user has received."
					}
				},
				organisedEvents: {
					bsonType: "array",
					title: "The events the user is organising/has organised.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "An event the user is organising/has organised."
					}
				},
				eventLimits: {
					bsonType: "long",
					title: "The maximum number of active events the user can have.",
					minimum: 0
				},
				invitationLimits: {
					bsonType: "long",
					title: "The maximum number of invitations to an event the user can send.",
					minimum: 0
				},
				admin: {
					bsonType: "bool",
					title: "Whether the user is an admin."
				},
				avatar: {
					anyOf: [{ bsonType: "objectId" }, { bsonType: "null" }],
					// The avatar can be an ObjectId or null
					title: "The user's avatar."
				},
				invitations: {
					bsonType: "array",
					title: "All private invitations the user has received.",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "One of the private invitations"
					}
				},
				requests: {
					bsonType: "array",
					title: "All public requests the user has received",
					uniqueItems: true,
					items: {
						bsonType: "objectId",
						title: "One of the requests"
					}
				},
				joinedEvents: {
					bsonType: "array",
					title: "The joined events.",
					items: {
						bsonType: "objectId",
						title: "A joined event."
					}
				},

			},
			additionalProperties: false
		}
	}
}