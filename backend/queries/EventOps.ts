import g_coExpress from "express"

const g_coRouter = g_coExpress.Router()

import g_coDb from "../server/db.ts"

const g_coEvents = g_coDb.collection("events")
const g_coInvitations = g_coDb.collection("invitations")

import g_codes from "../server/statuses.ts"
import { ObjectId } from "mongodb"
import { getGridFSBucket } from "../server/gridfs.ts"
import multer from "multer"
import { Readable } from "stream"
import { uploadImage } from "../server/imageUpload.ts"

const g_coUsers = g_coDb.collection("users")
const g_co = multer()
g_coRouter.post("/", g_coExpress.json(), async function (a_oRequest, a_oResponse) {
	const { eventName, eventLocation, eventDescription, eventTime, isPublic, images } = a_oRequest.body
	try {
		const newEventID = await g_coEvents.insertOne({
			eventName: eventName,
			eventLocation: eventLocation,
			eventDescription: eventDescription,
			discussionDescription: "",
			eventTime: new Date(eventTime),
			public: isPublic,
			images: new ObjectId(images),
			organiserID: a_oRequest.session["User ID"],
			participation: [],
			discussionBoard: [],
			notifications: [],
			joinedUsers: [],
		})

		// Update the user's document to include this event
		await g_coUsers.updateOne(
			{ _id: a_oRequest.session["User ID"] },
			{ $push: { organisedEvents: newEventID.insertedId } }
		)

		a_oResponse.sendStatus(g_codes("Success"))
		
	} catch (error) {
		console.error("Error:", error)
		a_oResponse.status(g_codes("Server error")).json({ error: error })
	}
})

g_coRouter.post("/image", g_co.single("image"), async function(a_oRequest, a_oResponse) {
	try {
		const file = a_oRequest.file
		if (!file) return a_oResponse.status(g_codes("Invalid"))
		const stream = Readable.from(file.buffer)
		const { id } = await uploadImage(stream, file.originalname, file.mimetype)
		a_oResponse.status(g_codes("Success")).json({ imageId: id })
	} catch (err) {a_oResponse.status(g_codes("Server error")).json({ error: "Image upload failed" })}
})

g_coRouter.post("/:id/invite", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
	try {
	  const eventId = a_oRequest.params.id
	  const { userIds } = a_oRequest.body
	  console.log(userIds)
	  const senderId = a_oRequest.session["User ID"]
  
	  // Verify ownership
	  const event = await g_coEvents.findOne({
		_id: new ObjectId(eventId),
		organiserID: new ObjectId(senderId)
	  })
  
	  if (!event) {
		return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Not authorized" })
	  }
  
	  // Check for any duplicates
	  const duplicateUserIds: string[] = []
	  for (const userId of userIds) {
		const existing = await g_coInvitations.findOne({
		  eventId: new ObjectId(eventId),
		  receiverId: new ObjectId(userId),
		  senderId: new ObjectId(senderId),
		})
		if (existing) {
		  duplicateUserIds.push(userId)
		}
	  }
  
	  // If any duplicates found, abort and return error
	  if (duplicateUserIds.length > 0) {
		return a_oResponse.status(g_codes("Conflict")).json({
		  error: "Some invitations already exist",
		  duplicateUserIds
		})
	  }
  
	  // No duplicates, we continue to create invitations and update event/user
	  const invitationResults = await Promise.all(
		userIds.map(async (userId: string) => {
		  const invitation = await g_coInvitations.insertOne({
			eventId: new ObjectId(eventId),
			receiverId: new ObjectId(userId),
			senderId: new ObjectId(senderId),
			state: "Pending"
		  })
		  return {
			receiverId: userId,
			invitationId: invitation.insertedId
		  }
		})
	  )
  
	  // Update event's participation array
	  await g_coEvents.updateOne(
		{ _id: new ObjectId(eventId) },
		{ $push: { participation: { $each: invitationResults.map(result => result.invitationId) } } }
	  )
  
	  // Update each user's invitations array
	  await Promise.all(
		invitationResults.map(async ({ receiverId, invitationId }) => {
		  await g_coUsers.updateOne(
			{ _id: new ObjectId(receiverId) },
			{ $push: { invitations: invitationId } }
		  )
		})
	  )
  
	  a_oResponse.sendStatus(g_codes("Success"))
	} catch (error) {
	  console.error("Invite error:", error)
	  a_oResponse.status(g_codes("Server error")).json({ error: "Invite failed" })
	}
  })

g_coRouter.get("/", async function(a_oRequest, a_oResponse) {
	try {
		const { public: sPublic, organiserId, _id } = a_oRequest.query
		const l_oFilter: any = {}
		if (sPublic !== undefined) {
			l_oFilter.public = sPublic === "true"
		}
		else if (_id !== undefined) {
			try {
				// Attempt to convert the _id string into a Mongo ObjectId
				// and add it to the filter for direct ID lookups
				l_oFilter["_id"] = new ObjectId(_id as string)
			} catch (err) {
				// If conversion fails, respond with 400 Bad Request
				return a_oResponse.status(400).json({ error: "Invalid _id" })
			}
		}


		// Fetch filtered event
		const l_aEvents = await g_coEvents.find(l_oFilter).toArray()

		// Send back events with HTTP 200
		a_oResponse.status(g_codes("Success")).json(l_aEvents)
	} catch (err) {
		console.error("Failed to fetch events:", err)
		a_oResponse.sendStatus(g_codes("Server error"))
	}
})

g_coRouter.get("/owned", async function(a_oRequest, a_oResponse) {
	try {
		const userId = a_oRequest.session["User ID"]

		const l_aEvents = await g_coEvents.find({ organiserID: userId }).toArray()

		a_oResponse.status(g_codes("Success")).json(l_aEvents)
	} catch (err) {
		console.error("Failed to fetch events:", err)
		a_oResponse.status(g_codes("Server error"))
	}
})
g_coRouter.get("/joined", async function(a_oRequest, a_oResponse) {
	try {
		const userId = a_oRequest.session["User ID"]

		const l_aEvents = await g_coEvents.find({ joinedUsers: userId }).toArray()

		a_oResponse.status(g_codes("Success")).json(l_aEvents)
	} catch (err) {
		console.error("Failed to fetch events:", err)
		a_oResponse.status(g_codes("Server error"))
	}
})
g_coRouter.get("/image/:id", async function(a_oRequest, a_oResponse) {
    try {
		const l_oId = new ObjectId(a_oRequest.params.id)

		const downloadStream = getGridFSBucket().openDownloadStream(l_oId)

		a_oResponse.set("Content-Type", "image/jpeg")

		const onError = function() {
			a_oResponse.sendStatus(g_codes("Not found"))
		}
		downloadStream
			.on("error", onError)
			.pipe(a_oResponse)
	} catch (a_oError) {
        a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid ID or error fetching image", details: a_oError })
    }
})

g_coRouter.put("/:id", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
    try {
        const eventId = a_oRequest.params.id
        const userId = a_oRequest.session["User ID"]
        
		  const { eventName, eventLocation, eventDescription, eventTime, images } = a_oRequest.body

        if (!ObjectId.isValid(eventId) || !ObjectId.isValid(userId)) {
            return a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid ID format" })
        }

        // Convert to ObjectId
        const eventObjectId = new ObjectId(eventId)
        const userObjectId = new ObjectId(userId)

        // Verify ownership
        const existingEvent = await g_coEvents.findOne({ 
            _id: eventObjectId,
            organiserID: userObjectId 
        })
		const updateData = {
            eventName,
            eventLocation,
            eventDescription,
			eventTime: new Date(eventTime), 
			images: new ObjectId(images)
        }

        if (!existingEvent) {
            return a_oResponse.status(g_codes("Unauthorised")).json({ 
                error: "Not authorized to update this event or event not found" 
            })
        }

        // Perform update
		const result = await g_coEvents.findOneAndUpdate(
            { _id: eventObjectId },
            { $set: updateData }, // Use validated data
            { returnDocument: 'after' }
        )
		//For the inform functionality

		 const updatedEvent = result
        
		 // Create notification
		 const notificationText = `Event details for this event have been updated`
		 const notification = await g_coDb.collection("notifications").insertOne({
			 text: notificationText,
			 reminder: false,
			 sendTime: new Date(),
			 eventId: eventObjectId,
			 sent: true
		 })

		 // Get recipients
		 let userIds = []
		 if (updatedEvent.public) {
			 userIds = updatedEvent.joinedUsers
		 } else {
			 const invitations = await g_coInvitations.find({
				 eventId: eventObjectId,
				 state: "Accepted"
			 }).toArray()
			 userIds = invitations.map(i => i.receiverId)
		 }
 
		 // Update user notifications
		 await g_coUsers.updateMany(
			 { _id: { $in: userIds } },
			 { $push: { notifications: notification.insertedId } }
		 )
 
		 // Update event notifications
		 await g_coEvents.updateOne(
			 { _id: eventObjectId },
			 { $push: { notifications: notification.insertedId } }
		 )
 


        a_oResponse.status(g_codes("Success")).json(result)
    } catch (error) {
        console.error("Update error:", error)
        a_oResponse.status(g_codes("Server error")).json({ error: "Failed to update event" })
    }
})

g_coRouter.put("/:id/discussion", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
  try {
    const eventId = a_oRequest.params.id
    const userId = a_oRequest.session["User ID"]
    const { description } = a_oRequest.body
    
    // Validate event ownership
    const event = await g_coEvents.findOne({
      _id: new ObjectId(eventId),
      organiserID: new ObjectId(userId)
    })

    if (!event) {
      return a_oResponse.status(g_codes("Unauthorised")).json({ 
        error: "Not authorized to update this event" 
      })
    }

    // Update discussion description
    await g_coEvents.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { discussionDescription: description } }
    )

    a_oResponse.sendStatus(g_codes("Success"))
  } catch (error) {
    console.error("Update discussion description error:", error)
    a_oResponse.status(g_codes("Server error")).json({ 
      error: "Failed to update discussion description" 
    })
  }
})

g_coRouter.delete("/image/:id",g_coExpress.json(), async function(a_oRequest, a_oResponse) {
	try {

	  if (!ObjectId.isValid(a_oRequest.params.id)) {
		return a_oResponse.status(g_codes("Invalid")).json({ 
		  error: "Invalid image ID format" 
		})
	  }
  
	  const l_oId = new ObjectId(a_oRequest.params.id)
	  const bucket = getGridFSBucket()
  
	  // Verify image exists
	  const [file, eventsUsingImage] = await Promise.all([
		bucket.find({ _id: l_oId }).toArray(),
		g_coEvents.countDocuments({ images: l_oId })
	  ])
	  
	  if (file.length === 0) return a_oResponse.status(g_codes("Not found")).json({ error: "Image not found" })
	  if (eventsUsingImage > 0) {
		return a_oResponse.status(g_codes("Conflict")).json({ 
		  error: "Image still in use by other events" 
		})
	  }
	  console.log("Deleting image with ID:", l_oId)
	  await bucket.delete(l_oId)
	  a_oResponse.sendStatus(g_codes("Success"))
	} catch (a_oError) {
	  console.error("Image deletion error:", a_oError)
	  a_oResponse.status(g_codes("Server error")).json({ 
		error: "Failed to delete image" 
	  })
	}
  })

export default g_coRouter