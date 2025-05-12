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
import multer from "multer"
import { Readable } from "stream"
import { uploadImage } from '../server/imageUpload.ts'
import g_coFilter from "../filters/UserFilter.ts"

g_coRouter.post("/", g_coExpress.json(), async function(a_oRequest, a_oResponse) {
	const { username, password, email, avatar, avatarZoom } = a_oRequest.body
	if (!username || !password || !email || !avatar) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing required fields" })

	try {
		// Existing user check  Correct
		
		const existingUser = await g_coUsers.findOne({$or: [{ username },{ emailAddress: email }]})
		// Conflict handling  Correct
		if (existingUser) {
			return a_oResponse.status(g_codes("Conflict")).json({ 
				error: existingUser.username === username ? "Username already exists": "Email already registered"})}

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
			avatar: new ObjectId(avatar),
			avatarZoom: parseFloat(avatarZoom) || 1.0,
			requests: [],
			invitations: [],
			joinedEvents: [],
			
		})
		a_oResponse.sendStatus(g_codes("Created")) //  Correct success status
	} catch (error) {
		// Add duplicate key check
		//console.log(error.errInfo.details.schemaRulesNotSatisfied[0]. propertiesNotSatisfied)
		if (error.code === 11000) return a_oResponse.status(g_codes("Conflict")).json({ error: "Username/email already exists" })
		a_oResponse.status(g_codes("Server error")).json({ error: "Server error during registration" })
	}
})
//POST for /verify-password because:
//It hides data in the request body.
//It aligns with common REST API design for secure operations.
g_coRouter.post("/verify-password", g_coExpress.json(), async (a_oRequest, a_oResponse) => {
	const userId = a_oRequest.session["User ID"]
	const { password } = a_oRequest.body
	if (!userId || !password) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing fields" })
  
	try {
	  const user = await g_coUsers.findOne({ _id: new ObjectId(userId) })
	  if (!user) return a_oResponse.status(g_codes("Not found")).json({ error: "User not found" })
  
	  const isMatch = await g_coBcrypt.compare(password, user.password)
	  if (!isMatch) return a_oResponse.status(g_codes("Unauthorised")).json({ error: "Incorrect password" })
  
	  a_oResponse.sendStatus(g_codes("Success"))
	} catch (err) {
		console.log(err)
	  a_oResponse.status(g_codes("Server error")).json({ error: "Failed to verify password" })
	}
  })

// GET Route
g_coRouter.get("/", async function(a_oRequest,  a_oResponse) {
	try {
		const results = await g_coUsers.find(
			g_coFilter(a_oRequest.query) // Use query instead of cookies
		).toArray()
		a_oResponse.status(g_codes("Success")).json(results)
	} catch (error) {a_oResponse.status(g_codes("Server error")).json(error)}
})

// GET Route for current user
g_coRouter.get("/me", async function(a_oRequest, a_oResponse) {
	try {
		const userId = a_oRequest.session["User ID"]

		// Validate session user ID
		if (!userId) {
			return a_oResponse.status(g_codes("Unauthorized")).json({ error: "User not logged in" })
		}

		// Fetch user details
		const user = await g_coUsers.findOne({ _id: new ObjectId(userId) },{ projection: { password: 0 } } )// Exclude password from response
		if (!user) {
			return a_oResponse.status(g_codes("Not found")).json({ error: "User not found" })
		}
		a_oResponse.status(g_codes("Success")).json(user)
	} catch (error) {a_oResponse.status(g_codes("Server error")).json({ error: "Error fetching user", details: error })}
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
    } catch (a_oError) {a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid ID or error fetching image", details: a_oError }) }
})

// POST Route for avatar upload
const g_co = multer()
g_coRouter.post("/image", g_co.single("image"), async function(a_oRequest, a_oResponse) {
  try {
    const file = a_oRequest.file
    if (!file) return a_oResponse.status(g_codes("Invalid"))
    const stream = Readable.from(file.buffer)
    const { id } = await uploadImage(stream, file.originalname, file.mimetype)
    a_oResponse.status(g_codes("Success")).json({ imageId: id })
  } catch (err) { a_oResponse.status(g_codes("Server error")).json({ error: "Image upload failed" }) }
})
// Provide flexibility for the InviteMemberModal and AccountPage
g_coRouter.get("/search", async function(a_oRequest, a_oResponse) {
	try {
		const query = a_oRequest.query.query as string
		
		if (!query || query.length < 1) {
		return a_oResponse.status(g_codes("Invalid")).json({ error: "Minimum 1 character required" })
		}

		const users = await g_coUsers.find({
		username: { $regex: `^${query}`, $options: 'i' }
		}).project({
		_id: 1,
		username: 1,
		emailAddress: 1
		}).limit(10).toArray()

		a_oResponse.status(g_codes("Success")).json(users)
	} catch (error) {
		console.error("Search error:", error)
		a_oResponse.status(g_codes("Server error")).json({ error: "Search failed" })
	}
  })

  g_coRouter.get("/is-admin", async function(a_oRequest, a_oResponse) {
	try {
		const userId = a_oRequest.session["User ID"]

		// Validate session user ID
		if (!userId) {
			return a_oResponse.status(g_codes("Unauthorized")).json({ error: "User not logged in" })
		}

		// Fetch user details (only admin field)
		const user = await g_coUsers.findOne({ _id: userId },{ projection: { admin: 1 } }	)
		// Return admin status
		a_oResponse.status(g_codes("Success")).json({ admin: user.admin })
	} catch (error) {
		a_oResponse.status(g_codes("Server error")).json({ error: "Error checking admin status", details: error })
	}
})

// GET Route for a specific user (This get route must be at the bottom of all gets)
g_coRouter.get("/:id", async function(a_oRequest, a_oResponse) {
    try {
        const userId = a_oRequest.params.id

        if (!ObjectId.isValid(userId)) {
            return a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid user ID format" })
        }

        const user = await g_coUsers.findOne({ _id: new ObjectId(userId) },{ projection: { password: 0 } } )// Exclude password
        if (!user)  return a_oResponse.status(g_codes("Not found")).json({ error: "User not found" })
        a_oResponse.status(g_codes("Success")).json(user)
    } catch (error) {
        console.error("User fetch error:", error)
        a_oResponse.status(g_codes("Server error")).json({ error: "Failed to fetch user" })
    }
})

// PUT Route update
g_coRouter.put("/", async function(a_oRequest, a_oResponse) {
	try {
		await g_coUsers.updateMany(
			g_coFilter(a_oRequest.body),
			{ $set: {
				username: a_oRequest.body.username,
				password: await g_coBcrypt.hash(
					a_oRequest.body.password, 
					parseInt(process.env.m_saltRounds || "10")
				),
				emailAddress: a_oRequest.body.email,
				admin: a_oRequest.body.admin
			} 
		})
		a_oResponse.sendStatus(g_codes("Success"))
	} catch (error) {a_oResponse.status(g_codes("Server error")).json(error)}	
})
//A Unified put methods for username, password, and avatar updates
// using switch case to handle different actions
g_coRouter.put("/update/:action", g_coExpress.json(), async (a_oRequest, a_oResponse) => {
	const userId = a_oRequest.session["User ID"]
	const action = a_oRequest.params.action

	switch (action) {
	case 'username':
		const { username } = a_oRequest.body
		if (!userId || !username) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing user or username" })

		try {
		// Check if username is taken (except for current user)
		const existing = await g_coUsers.findOne({ username, _id: { $ne: new ObjectId(userId) } })
		if (existing) return a_oResponse.status(g_codes("Conflict")).json({ error: "Username already exists" })

		// Get old username
		const user = await g_coUsers.findOne({ _id: new ObjectId(userId) })
		if (!user) return a_oResponse.status(g_codes("Not found")).json({ error: "User not found" })
		const oldUsername = user.username

		// Update username in users
		await g_coUsers.updateOne({ _id: new ObjectId(userId) }, { $set: { username } })

		// Update "Sender username" in requests
		await g_coDb.collection("requests").updateMany({ "Sender username": oldUsername },{ $set: { "Sender username": username } } )
		a_oResponse.sendStatus(g_codes("Success"))
		} catch (err) {a_oResponse.status(g_codes("Server error")).json({ error: "Failed to update username" })}
		break

	case 'password':
		const { currentPassword, newPassword } = a_oRequest.body
		if (!userId || !currentPassword || !newPassword) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing fields" })

		try {
			const user = await g_coUsers.findOne({ _id: new ObjectId(userId) })
			if (!user) return a_oResponse.status(g_codes("Not found")).json({ error: "User not found" })

			const isMatch = await g_coBcrypt.compare(currentPassword, user.password)
			if (!isMatch) return a_oResponse.status(g_codes("Unauthorized")).json({ error: "Current password incorrect" })

			await g_coUsers.updateOne(
				{ _id: new ObjectId(userId) },
				{ $set: { password: await g_coBcrypt.hash(newPassword, parseInt(process.env.m_saltRounds || "10")) } }
			)
			a_oResponse.sendStatus(g_codes("Success"))
			} catch (err) { a_oResponse.status(g_codes("Server error")).json({ error: "Failed to update password" })}
			break

		case 'avatar':
			const { avatar, avatarZoom } = a_oRequest.body
			if (!userId || !avatar) return a_oResponse.status(g_codes("Invalid")).json({ error: "Missing avatar" })

			try {
			await g_coUsers.updateOne(
				{ _id: new ObjectId(userId) },
				{ 
				$set: { 
					avatar: new ObjectId(avatar),
					avatarZoom: parseFloat(avatarZoom) || 1.0
				} 
				}
			)
			a_oResponse.sendStatus(g_codes("Success"))
		} catch (err) {
			console.error('Avatar update error:', err)
			a_oResponse.status(g_codes("Server error")).json({ error: "Failed to update avatar" })
		}
		break

	default:
		a_oResponse.status(g_codes("Invalid")).json({ error: "Invalid action" })
	}
})

export default g_coRouter
