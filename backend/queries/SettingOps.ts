import g_coExpress from "express"

const g_coRouter = g_coExpress.Router()

import g_coDb from "../server/db.ts"
import g_codes from "../server/statuses.ts"

const g_coUsers = g_coDb.collection("users")
const g_coSettings = g_coDb.collection("settings")

async function g_bAdmin(a_oRequest, a_oResponse, a_oNext) {
	try {
		return (await g_coUsers.findOne({ _id: a_oRequest.session["User ID"] })).admin ? a_oNext() : a_oResponse.sendStatus(g_codes("Invalid"))
	} catch (a_oError) {
		a_oResponse.status(g_codes("Server error")).json(a_oError)
	}
}

g_coRouter.get("/", async function (a_oRequest, a_oResponse) {
	try {
		const settings = await g_coSettings.findOne(
			{_id: "global_settings"},
		)
		a_oResponse.status(g_codes("Success")).json(settings)
	} catch (error) {
		console.log(error)
		a_oResponse.status(g_codes("Error"))
	}
})

g_coRouter.put("/", g_bAdmin, g_coExpress.json(), async function (a_oRequest, a_oResponse) {
	console.log(JSON.stringify(a_oRequest.body))
	const {eventLimit, invitationLimit} = a_oRequest.body
	console.log(eventLimit)
	try {
		const res = await g_coSettings.findOneAndUpdate(
			{ _id: "global_settings" },
			{ $set: {eventLimit: eventLimit, invitationLimit: invitationLimit} },
			{ new: true },
		)
		a_oResponse.status(g_codes("Success")).json({
			message: "Global settings updated.",
			updatedSettings: res
		})
	} catch (error) {
		console.log('Error details:', error)
		a_oResponse.status(g_codes("Error")).json({message: "Failed to update global settings"})
	}
})

export default g_coRouter