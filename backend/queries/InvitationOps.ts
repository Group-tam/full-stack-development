import { Router } from "express"
import g_coExpress from "express"

const g_coRouter = Router()

import g_coDb from "../server/db.ts"

const g_coInvitations = g_coDb.collection("invitations")

import g_codes from "../server/statuses.ts"
import { ObjectId } from "mongodb"
const g_coEvents = g_coDb.collection("events")
const g_coUsers = g_coDb.collection("users")


g_coRouter.get("/received", async function(a_oRequest, a_oResponse) {
	try {
		const userId = a_oRequest.session["User ID"]

		const l_aResponse = await g_coInvitations.find({
				receiverId: userId,
		}).toArray()

		a_oResponse.status(g_codes("Success")).json(l_aResponse)
	} catch (a_oError) {
		console.log(a_oError)
		return a_oResponse.status(g_codes("Server error")).json(a_oError)
	}
})	

g_coRouter.get("/user-invitations", async (a_oRequest, a_oResponse) => {
	try {
		const userId = new ObjectId(a_oRequest.session["User ID"])
		const invitations = await g_coInvitations.find({
			receiverId: userId
		}).toArray()

		const enrichedInvitations = await Promise.all(
			invitations.map(async (invitation) => {
				const event = await g_coEvents.findOne(
					{ _id: new ObjectId(invitation.eventId) },
					{ projection: { eventName: 1, eventTime: 1, organiserID: 1 } }
				)
				let username = ""
				if (event?.organiserID) {
					const organizer = await g_coUsers.findOne(
						{ _id: new ObjectId(event.organiserID) },
						{ projection: { username: 1 } }
					)
					username = organizer?.username || ""
				}
				return {
					_id: invitation._id,
					type: "invitation",
					eventName: event?.eventName,
					username,
					status: invitation.state,
					eventTime: event?.eventTime
				}
			})
		)

		a_oResponse.status(g_codes("Success")).json(enrichedInvitations)
	} catch (error) {
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})


g_coRouter.patch("/:id", g_coExpress.json(), async (a_oRequest, a_oResponse) => {
	try {
		const { state } = a_oRequest.body
		const invitationId = new ObjectId(a_oRequest.params.id)
		
		await g_coInvitations.updateOne(
			{ _id: invitationId },
			{ $set: { state } }
		)
		
		if (state === "Accepted") {
			const invitation = await g_coInvitations.findOne({ _id: invitationId })
			await g_coEvents.updateOne(
				{ _id: new ObjectId(invitation.eventId) },
				{ $addToSet: { joinedUsers: new ObjectId(invitation.receiverId) } }
			)
		}
		
		a_oResponse.sendStatus(g_codes("Success"))
	} catch (error) {
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})

g_coRouter.get("/sent-invitations", async (a_oRequest, a_oResponse) => {
	try {
		const organizerId = a_oRequest.session["User ID"]
		if (!organizerId) return a_oResponse.status(g_codes("Unauthorised")).json({ error: "Not logged in" })

		const events = await g_coEvents.find(
			{ organiserID: new ObjectId(organizerId) },
			{ projection: { _id: 1, eventName: 1, eventTime: 1 } }
		).toArray()

		const invitations = await g_coInvitations.find({
			eventId: { $in: events.map(e => e._id) }
		}).toArray()

		const enrichedInvitations = await Promise.all(
			invitations.map(async (invitation) => {
				const event = events.find(e => e._id.equals(invitation.eventId))
				const receiver = await g_coUsers.findOne(
					{ _id: new ObjectId(invitation.receiverId) },
					{ projection: { username: 1 } }
				)
				return {
					_id: invitation._id,
					eventName: event?.eventName || "",
					username: receiver?.username || "",
					status: invitation.state,
					eventTime: event?.eventTime
				}
			})
		)

		a_oResponse.status(g_codes("Success")).json(enrichedInvitations)
	} catch (error) {
		console.error("Error fetching sent invitations:", error)
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})

export default g_coRouter
