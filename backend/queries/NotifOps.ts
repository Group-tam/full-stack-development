// backend/queries/NotifOps.ts
import { Router } from "express"
const g_coRouter = Router()
import g_coDb from "../server/db.ts"
import { ObjectId } from "mongodb"
import g_codes from "../server/statuses.ts"
import g_coExpress from "express"
// This route handler is used by the notification webworker in order to check and update the notifications
g_coRouter.put("/process", async (a_oRequest, a_oResponse) => {
	try {
		const now = new Date()
		let processedCount = 0
		const pendingNotifications = await g_coDb.collection("notifications")
			.find({ 
				sent: false,
				sendTime: { $lte: now }
			}).toArray()

		for (const notification of pendingNotifications) {
			const event = await g_coDb.collection("events")
				.findOne({ _id: notification.eventId })

			// Get recipients based on saved option
			let recipientIds = []
			if (event.public) {
				recipientIds = event.joinedUsers //Only the joined users of the public event will received the notifications
			} else { //In case of the private event the notification must be associated with one of the four options.
				// Use the original option from when notification was created
				switch(notification.option) {
					case 'accepted-private':
						const acceptedInvites = await g_coDb.collection("invitations").find({
							eventId: event._id,
							state: "Accepted"
						}).toArray()
						recipientIds = acceptedInvites.map(inv => inv.receiverId)
						break
					case 'pending-private':
						const pendingInvites = await g_coDb.collection("invitations").find({
							eventId: event._id,
							state: "Pending"
						}).toArray()
						recipientIds = pendingInvites.map(inv => inv.receiverId)
						break
					case 'all-private':
						const allInvites = await g_coDb.collection("invitations").find({
							eventId: event._id,
							state: { $ne: "Declined" }
						}).toArray()
						recipientIds = allInvites.map(inv => inv.receiverId)
						break
				}
			}

			// Add to user notifications
			await Promise.all(recipientIds.map(userId => 
				g_coDb.collection("users").updateOne(
					{ _id: userId },
					{ $push: { notifications: notification._id } }
				)
			))

			// Mark as sent
			await g_coDb.collection("notifications").updateOne(
				{ _id: notification._id },
				{ $set: { sent: true } }
			)
			processedCount++
		}

		a_oResponse.status(g_codes("Success")).json({ processed: processedCount })
	} catch (error) {
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})

// Get user notifications
//This route has to be in NotifOps since it return notifications
g_coRouter.get("/user", async (a_oRequest, a_oResponse) => {
	try {
		const userId = new ObjectId(a_oRequest.session["User ID"])
		const user = await g_coDb.collection("users").findOne({ _id: userId })
		
		const notifications = await g_coDb.collection("notifications").find({
			_id: { $in: user?.notifications || [] }
		}).toArray()

		a_oResponse.status(g_codes("Success")).json(notifications)
	} catch (error) {
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})

g_coRouter.delete("/:id", async (a_oRequest, a_oResponse) => {
	try {
		const userId = new ObjectId(a_oRequest.session["User ID"])
		const notificationId = new ObjectId(a_oRequest.params.id)

		// Remove from user's notifications array
		await g_coDb.collection("users").updateOne(
			{ _id: userId },
			{ $pull: { notifications: notificationId } }
		)

		// Delete the notification document
		await g_coDb.collection("notifications").deleteOne({
			_id: notificationId
		})

		a_oResponse.sendStatus(g_codes("Success"))
	} catch (error) {
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})

// Inform users about event updates
g_coRouter.post("/inform", g_coExpress.json(), async (a_oRequest, a_oResponse) => {
	try {
		const { eventId, message, option, minutesBefore } = a_oRequest.body
		const eventObjectId = new ObjectId(eventId)
		const event = await g_coDb.collection("events").findOne({ _id: eventObjectId })
		
		// Store the recipient selection with the notification
		const notification = await g_coDb.collection("notifications").insertOne({
			text: message,
			eventId: eventObjectId,
			sendTime: minutesBefore ? 
				new Date(event.eventTime.getTime() - minutesBefore * 60000) : 
				new Date(),
			reminder: true,
			sent: false,
			option // Save the option with the notification
		})

		// Link to event
		await g_coDb.collection("events").updateOne(
			{ _id: eventObjectId },
			{ $push: { notifications: notification.insertedId } }
		)

		// Get recipients based on option
		let recipientIds = []
		switch(option) {
			case 'accepted-private':
				const acceptedInvites = await g_coDb.collection("invitations").find({
					eventId: eventObjectId,
					state: "Accepted"
				}).toArray()
				recipientIds = acceptedInvites.map(inv => inv.receiverId)
				break
			case 'pending-private':
				const pendingInvites = await g_coDb.collection("invitations").find({
					eventId: eventObjectId,
					state: "Pending"
				}).toArray()
				recipientIds = pendingInvites.map(inv => inv.receiverId)
				break
			case 'all-private':
				const allInvites = await g_coDb.collection("invitations").find({
					eventId: eventObjectId,
					state: { $ne: "Declined" }
				}).toArray()
				recipientIds = allInvites.map(inv => inv.receiverId)
				break
			default: // For public events, all joined users will receive the notification
				recipientIds = event.joinedUsers
		}

		// For immediate notifications 
		// Since for immediate notifications, the minutesBefore would be undefined hence this if block executes
		//As shown, the users get the notification immediately and the notification is marked as sent
		if (!minutesBefore) {
			await g_coDb.collection("users").updateMany(
				{ _id: { $in: recipientIds } },
				{ $push: { notifications: notification.insertedId } }
			)
			await g_coDb.collection("notifications").updateOne(
				{ _id: notification.insertedId },
				{ $set: { sent: true } }
			)
		}

		a_oResponse.status(g_codes("Success")).json(notification.insertedId)
	} catch (error) {
		console.error('Error creating notification:', error)
		a_oResponse.status(g_codes("Server error")).json({ error: error.message })
	}
})

export default g_coRouter