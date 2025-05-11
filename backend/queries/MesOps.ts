import { Router } from "express"
const g_coRouter = Router()
import g_coDb from "../server/db.ts"
import { ObjectId } from "mongodb"
import g_codes from "../server/statuses.ts"
import g_coAuth from "../server/auth.ts"
import g_coExpress from "express"
g_coRouter.use(g_coExpress.json())


// Get messages for event
g_coRouter.get("/", async (a_oRequest, a_oResponse) => {
    try {
        const { eventId: l_sEventId } = a_oRequest.query
        const l_oUserId = a_oRequest.session["User ID"]
        if (!l_sEventId || !ObjectId.isValid(l_sEventId)) {
            return a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid Event ID" })
        }
        const l_oEventId = new ObjectId(l_sEventId)
        const l_coEvent = await g_coDb.collection("events").findOne({ _id: l_oEventId })

        if (!l_coEvent) return a_oResponse.status(g_codes("Not found")).json({ error: "Event not found" })

        // Authorization check
        if (!l_coEvent.public) {
            if (!l_oUserId) return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Login required" })
            
            const l_bIsParticipant = l_coEvent.joinedUsers.some(u => u.equals(l_oUserId))
            const l_bIsOrganizer = l_coEvent.organiserID.equals(l_oUserId)
            
            if (!l_bIsParticipant && !l_bIsOrganizer) {
                return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Not authorized" })
            }
        }

        // Get messages with user details
        const l_aMessages = await g_coDb.collection("messages").aggregate([
            { $match: { eventId: l_oEventId } },
            { $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "user"
            }},
            { $unwind: "$user" },
            { $addFields: {
                isOrganizer: { $eq: ["$user._id", l_coEvent.organiserID] }
            }},
            { $project: {
                _id: 1,
                text: 1,
                eventId: { $toString: "$eventId" },  
                senderId: { $toString: "$senderId" },  
                createdAt: 1,
                updatedAt: 1,
                parentMessageId: {
                    $cond: [
                      { $ifNull: ["$parentMessageId", false] },
                      { $toString: "$parentMessageId" },
                      undefined
                    ]
                  },
                user: {
                    _id: 1,
                    username: 1,
                    avatar: 1,
                    avatarZoom: 1
                },
                isOrganizer: 1
            }},
            { $sort: { createdAt: 1 } }
        ]).toArray()

        a_oResponse.status(g_codes("Success")).json(l_aMessages)
    } catch (a_oError) {
        a_oResponse.status(g_codes("Server error")).json({ error: a_oError.message })
    }
})

// Create message
g_coRouter.post("/", g_coAuth, async (a_oRequest, a_oResponse) => {
    try {
        const { eventId: l_sEventId, text, parentMessageId } = a_oRequest.body
        const l_oUserId = a_oRequest.session["User ID"]

        if (!l_sEventId || !ObjectId.isValid(l_sEventId)) {

            return a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid Event ID" })
        }
        const l_oEventId = new ObjectId(l_sEventId)
        const l_coEvent = await g_coDb.collection("events").findOne({ _id: l_oEventId })
        if (!l_coEvent) return a_oResponse.status(g_codes("Not found")).json({ error: "Event not found" })

        // Check participation
        const l_bIsOrganizer = l_coEvent.organiserID.equals(l_oUserId)
        const l_bIsParticipant = l_coEvent.joinedUsers.some(u => u.equals(l_oUserId))
        
        if (!l_bIsOrganizer && !l_bIsParticipant) {
            return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Not authorized to comment" })
        }
        const l_oNewMessage = {
            text,
            senderId: l_oUserId,
            eventId: l_oEventId,
            parentMessageId: parentMessageId ? new ObjectId(parentMessageId) : null,
            createdAt: new Date(),
            updatedAt: null
        }
        const l_coResult = await g_coDb.collection("messages").insertOne(l_oNewMessage)
        // Update event's discussion board
        await g_coDb.collection("events").updateOne(
            { _id: l_oEventId },
            { $push: { discussionBoard: l_coResult.insertedId } }
        )

        a_oResponse.status(g_codes("Created")).json({ messageId: l_coResult.insertedId })
    } catch (a_oError) {
        a_oResponse.status(g_codes("Server error")).json({ error: a_oError.message })
    }
})

// Update message
g_coRouter.put("/", g_coAuth, async (a_oRequest, a_oResponse) => {
    try {
        const { messageId, text } = a_oRequest.body
        const l_oUserId = a_oRequest.session["User ID"]

        if (!messageId || !ObjectId.isValid(messageId)) {
            return a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid Message ID" })
        }

        const l_oMessageId = new ObjectId(messageId)
        const l_coMessage = await g_coDb.collection("messages").findOneAndUpdate(
            { _id: l_oMessageId },
            { $set: { text, updatedAt: new Date() } },
            { returnDocument: 'after' }
        )

        if (!l_coMessage) return a_oResponse.status(g_codes("Not found")).json({ error: "Message not found" })
        if (!l_coMessage.senderId.equals(l_oUserId)) {
            return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Not authorized" })
        }

        const user = await g_coDb.collection("users").findOne({ _id: l_coMessage.senderId })
        const event = await g_coDb.collection("events").findOne({ _id: l_coMessage.eventId })
        const responseData = {
            _id: l_coMessage._id.toString(),
            text: l_coMessage.text,
            senderId: l_coMessage.senderId.toString(),
            eventId: l_coMessage.eventId.toString(),
            parentMessageId: l_coMessage.parentMessageId?.toString(),
            createdAt: l_coMessage.createdAt,
            updatedAt: l_coMessage.updatedAt,
            user: {
                _id: user._id.toString(),
                username: user.username,
                avatar: user.avatar,
                avatarZoom: user.avatarZoom
            },
            isOrganizer: event.organiserID.equals(l_coMessage.senderId)
        }
        a_oResponse.status(g_codes("Success")).json(responseData)
    } catch (a_oError) {
        a_oResponse.status(g_codes("Server error")).json({ error: a_oError.message })
    }
})

// Delete message
g_coRouter.delete("/", g_coAuth, async (a_oRequest, a_oResponse) => {
    try {
        const { messageId } = a_oRequest.body
        const l_oUserId = a_oRequest.session["User ID"]

        if (!messageId || !ObjectId.isValid(messageId)) {
            return a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid Message ID" })
        }

        const l_oMessageId = new ObjectId(messageId)
        const l_coMessage = await g_coDb.collection("messages").findOne({ _id: l_oMessageId })

        if (!l_coMessage) return a_oResponse.status(g_codes("Not found")).json({ error: "Message not found" })

        const l_coEvent = await g_coDb.collection("events").findOne({ 
            _id: l_coMessage.eventId 
        })

        // Authorization check
        const l_bIsSender = l_coMessage.senderId.equals(l_oUserId)
        const l_bIsOrganizer = l_coEvent?.organiserID.equals(l_oUserId)

        if (!l_bIsSender && !l_bIsOrganizer) {
            return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Not authorized" })
        }

        // Find all descendant messages (replies and nested replies)
        let l_aMessagesToDelete = [l_oMessageId]
        let l_aCurrentParentIds = [l_oMessageId]
        let l_bFoundMore = true

        while (l_bFoundMore) {
            const l_aChildMessages = await g_coDb.collection("messages")
                .find({ parentMessageId: { $in: l_aCurrentParentIds } })
                .toArray()

            if (l_aChildMessages.length === 0) {
                l_bFoundMore = false
            } else {
                const l_aNewParentIds = l_aChildMessages.map(m => m._id)
                l_aMessagesToDelete.push(...l_aNewParentIds)
                l_aCurrentParentIds = l_aNewParentIds
            }
        }

        // Delete all messages in the list
        await g_coDb.collection("messages").deleteMany({
            _id: { $in: l_aMessagesToDelete }
        })

        // Remove all deleted message IDs from the event's discussionBoard
        await g_coDb.collection("events").updateOne(
            { _id: l_coMessage.eventId },
            { $pull: { discussionBoard: { $in: l_aMessagesToDelete } } }
        )

        a_oResponse.sendStatus(g_codes("Success"))
    } catch (a_oError) {
        a_oResponse.status(g_codes("Server error")).json({ error: a_oError.message })
    }
})

export default g_coRouter