import g_coExpress from "express"
const g_coRouter = g_coExpress.Router()

import g_coDb from "../server/db.ts"

const g_coUsers = g_coDb.collection("users")
await g_coUsers.createIndex({ username: 1 }, { unique: true })

import g_coBcrypt from "bcrypt"
import "dotenv/config"
import g_codes from "../server/statuses.ts"
import { ObjectId } from "mongodb"
import { getGridFSBucket } from "../server/gridfs.ts"

//g_coApp.use(g_coExpress.json())
// HTTP methods for the user operations in this Express router

g_coRouter.post("/", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
   /*EXAMPLE
   //Request body: {
  username: 'Huy Mai2',
  password: 'examplePASSWORD123!',
  email: 'fallsgravity437@gmail.com' 
}*/
	const { username, password, email } = a_oRequest.body
//console.log(a_oRequest.body)
	// Validate required fields Correct
	if (!username || !password || !email) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing required fields" })

	try {
		// Existing user check  Correct
		
		const existingUser = await g_coUsers.findOne({
			$or: [
				{ username },
				{ emailAddress: email }
			]
		})

		// Conflict handling  Correct
		if (existingUser) {
			return a_oResponse.status(g_codes("Conflict")).json({ 
				error: existingUser.username === username
					? "Username already exists"
					: "Email already registered"
			})
		}

		// User creation  Schema-compliant
		await g_coUsers.insertOne({
			username,
			password: await g_coBcrypt.hash(
				password, 
				parseInt(process.env.m_saltRounds || "10") //  Ensure SALT_ROUNDS is numeric with default value
			),
			emailAddress: email, //  Matches schema
			admin: false, //  Default non-admin
			notifications: [],
			organisedEvents: [],
			eventLimits: BigInt(0),
			invitationLimits: BigInt(0),
			avatar: null,
			requests: [],
			
		})
		a_oResponse.sendStatus(g_codes("Created")) //  Correct success status
	} catch (error) {
		// Add duplicate key check
		if (error.code === 11000) return a_oResponse.status(g_codes("Conflict")).json({ error: "Username/email already exists" })
		a_oResponse.status(g_codes("Server error")).json({ error: "Server error during registration" })
	}
})
import g_coFilter from "../filters/UserFilter.ts"

// GET Route update
g_coRouter.get("/", async function(req, res) {
	try {
		const results = await g_coUsers.find(
			g_coFilter(req.body) // Use body instead of cookies
		).toArray()
		res.status(g_codes("Success")).json(results)
	} catch (error) {
		res.status(g_codes("Server error")).json(error)
	}
})

g_coRouter.get("/:id", async function(req, res) {
	try {
		const result = await g_coUsers.findOne({
			_id: req.params.id,
		})
		res.status(g_codes("Success")).json(result);
	} catch (error) {
		res.status(g_codes("Server error")).json(error)
	}
})

// GET Route for avatar
g_coRouter.get("/image/:id", async function(a_oRequest, a_oResponse) {
    try {
		const l_oId = new ObjectId(a_oRequest.params.id)
		const downloadStream = getGridFSBucket().openDownloadStream(l_oId)
		a_oResponse.set("Content-Type", "image/jpeg")
		downloadStream
			.on("error", () => a_oResponse.sendStatus(g_codes("Not found")))
			.pipe(a_oResponse)
    } catch (a_oError) {
        a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid ID or error fetching image", details: a_oError })
    }
})

// PUT Route update
g_coRouter.put("/", async function(req, res) {
	try {
		await g_coUsers.updateMany(
			g_coFilter(req.body),
			{ $set: {
				username: req.body.username,
				password: await g_coBcrypt.hash(
					req.body.password, 
					parseInt(process.env.m_saltRounds || "10")
				),
				emailAddress: req.body.email,
				admin: req.body.admin
			} 
		})
		res.sendStatus(g_codes("Success"))
	} catch (error) {
		res.status(g_codes("Server error")).json(error)
	}
})

g_coRouter.delete("/", async function(a_oRequest, a_oResponse) {
	
})

export default g_coRouter
