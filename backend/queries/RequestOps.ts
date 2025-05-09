import g_coExpress from "express"

const g_coRouter = g_coExpress.Router()

import g_coDb from "../server/db.ts"

const g_coRequests = g_coDb.collection("requests")
const g_coEvents = g_coDb.collection("events")
const g_coUsers = g_coDb.collection("users")

import { ObjectId } from "mongodb"
import g_codes from "../server/statuses.ts"
g_coRouter.post("/", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
    console.log("USER ID", a_oRequest.session["User ID"])
    const l_coSession = globalThis.g_oConnection.startSession()
    try {
        const { eventId } = a_oRequest.body
        if (!eventId) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing eventId" })

        const l_coEvent = await g_coEvents.findOne(
            { _id: ObjectId.createFromHexString(eventId) },
            { projection: { requests: 1, organiserID: 1 } })
        const l_coSender = await g_coUsers.findOne(
            { _id: a_oRequest.session["User ID"] },
            { projection: { username: 1, requests: 1 } })
        l_coSession.startTransaction()
        const l_coRequest = await g_coRequests.insertOne({
            "Sender username": l_coSender.username,
            state: "Unanswered",
            eventId: l_coEvent._id,
            senderId: new ObjectId(a_oRequest.session["User ID"]),
            receiverId: new ObjectId(l_coEvent.organiserID)
        })
		await g_coEvents.updateOne(
            { _id: l_coEvent._id },
            { $push: { participation: l_coRequest.insertedId } }
        )
        await g_coUsers.updateOne(
            { _id: l_coSender._id },
            { $push: { requests: l_coRequest.insertedId } }
        )
        await l_coSession.commitTransaction()
    } catch (a_oError) {
        console.error("Error in request creation:", a_oError)
        await l_coSession.abortTransaction()
        l_coSession.endSession()
        return a_oResponse.status(g_codes("Server error")).json(a_oError)
    }
    l_coSession.endSession()
    a_oResponse.sendStatus(g_codes("Success"))
})
g_coRouter.get("/", async function(a_oRequest, a_oResponse) {
    try {
	  const eventId = a_oRequest.query.eventId
	  if (!eventId) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing eventId" })
  
	  a_oResponse.status(g_codes("Success")).json(a_oRequest.query.all ?
		await g_coRequests.find(
		  { eventId: ObjectId.createFromHexString(eventId as string) },
		  { projection: { "Sender username": 1, state: 1 } }
		).toArray() : await g_coRequests.findOne({
		  "Sender username": (await g_coUsers.findOne(
			{ _id: a_oRequest.session["User ID"] },
			{ projection: { username: 1 } }
		  )).username,
		  eventId: ObjectId.createFromHexString(eventId as string)
		}))
	} catch (a_oError) {
	  a_oResponse.status(g_codes("Server error")).json(a_oError)
	}
  })
g_coRouter.put("/", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
    const { requestId, newState } = a_oRequest.body
    if (!requestId || !newState) {
        return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing requestId or newState" })
    }
    try {
        // Update the request state
        await g_coRequests.updateOne(
            { _id: ObjectId.createFromHexString(requestId) },
            { $set: { state: newState } }
        )
          // If accepted, add sender to joinedUsers of the event
          if (newState === "Accepted") {
            const request = await g_coRequests.findOne({ _id: ObjectId.createFromHexString(requestId) })
            if (request && request.eventId && request.senderId) {
                await g_coEvents.updateOne(
                    { _id: new ObjectId(request.eventId) },
                    { $addToSet: { joinedUsers: new ObjectId(request.senderId) } }
                )
            }
        }
    } catch (a_oError) {
        console.error("Error in request update:", a_oError)
        return a_oResponse.status(g_codes("Server error")).json(a_oError)
    }
    a_oResponse.sendStatus(g_codes("Success"))
})
g_coRouter.delete("/", function(a_oRequest, a_oResponse) {
	
})
//Get the requests sent by the user
g_coRouter.get("/my-requests", async function(a_oRequest, a_oResponse) {
  try {
    const userId = a_oRequest.session["User ID"]
    if (!userId) return a_oResponse.status(g_codes("Unauthorised")).json({ error: "Not logged in" })

    // Get user's requests from users collection
    const user = await g_coUsers.findOne(
      { _id: new ObjectId(userId) },
      { projection: { requests: 1 } }
    )

    if (!user?.requests) return a_oResponse.status(g_codes("Success")).json([])

    // Get full request details
    const requests = await g_coRequests.find({
      _id: { $in: user.requests.map(id => new ObjectId(id)) }
    }).toArray()

    // Enrich with event and receiver details
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const event = await g_coEvents.findOne(
          { _id: new ObjectId(request.eventId) },
          { projection: { eventName: 1, eventTime: 1, organiserID: 1 } }
        )
        const organizer = await g_coUsers.findOne(
          { _id: new ObjectId(request.receiverId) },
          { projection: { username: 1 } }
        )
        return {
          _id: request._id,
          eventName: event?.eventName || "",
          username: organizer?.username || "", // event owner's name
          status: request.state,
          eventTime: event?.eventTime
        }
      })
    )

    a_oResponse.status(g_codes("Success")).json(enrichedRequests)
  } catch (error) {
    console.error("Error fetching sent requests:", error)
    a_oResponse.status(g_codes("Server error")).json({ error: error.message })
  }
})
g_coRouter.get("/organizer-responses", async (a_oRequest, a_oResponse) => {
    try {
      const organizerId = a_oRequest.session["User ID"]
      if (!organizerId) return a_oResponse.status(g_codes("Unauthorised")).json({ error: "Not logged in" })
  
      const events = await g_coEvents.find({ organiserID: new ObjectId(organizerId) }).toArray()
      const eventIds = events.map(e => e._id)
      const requests = await g_coRequests.find({
        eventId: { $in: eventIds }
      }).toArray()
  
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const user = await g_coUsers.findOne(
            { _id: new ObjectId(request.senderId) },
            { projection: { username: 1 } }
          )
          const event = events.find(e => e._id.equals(request.eventId))
          return {
            _id: request._id,
            type: "request",
            eventName: event?.eventName || "",
            username: user?.username || "",
            status: request.state,
            eventTime: event?.eventTime || new Date()
          }
        })
      )
  
      a_oResponse.status(g_codes("Success")).json(enrichedRequests)
    } catch (error) {
      a_oResponse.status(g_codes("Server error")).json({ error: error.message })
    }
})
g_coRouter.patch("/:id", g_coExpress.json(), async (a_oRequest, a_oResponse) => {
  try {
    const { state } = a_oRequest.body
    const requestId = new ObjectId(a_oRequest.params.id)
    
    await g_coRequests.updateOne(
      { _id: requestId },
      { $set: { state } }
    )
    
    if (state === "Accepted") {
      const request = await g_coRequests.findOne({ _id: requestId })
      await g_coEvents.updateOne(
        { _id: new ObjectId(request.eventId) },
        { $addToSet: { joinedUsers: new ObjectId(request.senderId) } }
      )
    }
    
    a_oResponse.sendStatus(g_codes("Success"))
  } catch (error) {
    a_oResponse.status(g_codes("Server error")).json({ error: error.message })
  }
})

export default g_coRouter
