import g_coExpress from "express"

const g_coRouter = g_coExpress.Router()

import g_coDb from "../server/db.ts"

const g_coRequests = g_coDb.collection("requests")
const g_coEvents = g_coDb.collection("events")
const g_coUsers = g_coDb.collection("users")

import g_cookieParser from "cookie-parser"
import { ObjectId } from "mongodb"
import g_codes from "../server/statuses.ts"
// HTTP methods for the request operations in this Express router
g_coRouter.post("/", g_cookieParser(), async function(a_oRequest, a_oResponse) {
	const l_coSession = globalThis.g_oConnection.startSession()
	try {
		const l_coEvent = g_coEvents.findOne(
			{ _id: ObjectId.createFromHexString(a_oRequest.cookies.m_sEvent) },
			{ projection: { requests: 1 } })
		const l_coSender = g_coUsers.findOne(
			{ _id: ObjectId.createFromHexString(a_oRequest.session["User ID"]) },
			{ projection: { requests: 1 } })
		l_coSession.startTransaction()
		const l_coRequest = await g_coRequests.insertOne({
			senderId: l_coSender._id,
			state: "Unanswered",
			eventId: l_coEvent._id
		})
		await g_coEvents.updateOne(
			{ _id: l_coEvent._id },
			{ $push: { participation: l_coRequest } }
		)
		await g_coUsers.updateOne(
			{ _id: l_coSender._id },
			{ $push: { requests: l_coRequest } }
		)
		await l_coSession.commitTransaction()
	} catch (a_oError) {
		await l_coSession.abortTransaction()
		l_coSession.endSession()
		return a_oResponse.status(g_codes("Server error")).json(a_oError)
	}
	l_coSession.endSession()
	a_oResponse.sendStatus(g_codes("Success"))
})
g_coRouter.get("/", g_cookieParser(), async function(a_oRequest, a_oResponse) {
	try {
		a_oResponse.status(g_codes("Success")).json(await g_coRequests.findOne({
			receiverId: ObjectId.createFromHexString(a_oRequest.session["User ID"]),
			eventId: ObjectId.createFromHexString(a_oRequest.cookies.m_sEvent)
		}))
	} catch (a_oError) {
		return a_oResponse.status(g_codes("Server error")).json(a_oError)
	}
})
g_coRouter.get("/sent", async function(a_oRequest, a_oResponse) {
	try {
		const userId = a_oRequest.session["User ID"]

		const l_aResponse = await g_coRequests.find({
			senderId: userId,
		}).toArray();

		a_oResponse.status(g_codes("Success")).json(l_aResponse)
	} catch (a_oError) {
		console.log(a_oError)
		return a_oResponse.status(g_codes("Server error")).json(a_oError)
	}
})

g_coRouter.put("/", function(a_oRequest, a_oResponse) {
	
})
g_coRouter.delete("/", function(a_oRequest, a_oResponse) {
	
})

export default g_coRouter
