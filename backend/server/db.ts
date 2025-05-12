import "dotenv/config"
import {MongoClient, ObjectId} from "mongodb"

globalThis.g_oConnection = new MongoClient("mongodb://" + process.env.m_sDbHost + ":" + process.env.m_sDbPort)
const g_coDb = await globalThis.g_oConnection.db(process.env.m_sDbName)

import { readdir } from "fs/promises"
import { setupGridFSBucket,getGridFSBucket } from "./gridfs.ts"
import g_coBcrypt from "bcrypt"

for (const l_csFileName of await readdir("backend/model")) {
	const l_coMod = await import("../model/" + l_csFileName)
	const l_csCollectionName = l_csFileName.replace(".t", "")
	switch ((await g_coDb.listCollections({ name: l_csCollectionName }).toArray()).length === 0) {
		case false:
			if (!("m_sDev" in process.env)) {
				console.warn("Existing " + l_csCollectionName + " ignored.")
				break
			}
			await g_coDb.dropCollection(l_csCollectionName)
			console.log("Dropped " + l_csCollectionName + ".")
		case true:
			await g_coDb.createCollection(l_csCollectionName, l_coMod.default)
			console.log("Created " + l_csCollectionName + ".")
	}
}

setupGridFSBucket(g_coDb)
await g_coDb.collection("settings").updateOne({	_id: "global_settings" }, { $setOnInsert: {
	_id: "global_settings",
	eventLimit: 5,
	invitationLimit: 10
} }, { upsert: true })
await g_coDb.collection("users").updateOne({ _id: ObjectId.createFromHexString("000000000000000000000000") }, { $setOnInsert: {
	_id: ObjectId.createFromHexString("000000000000000000000000"),
		username: "admin",
		password: await g_coBcrypt.hash(
			"AdminPassword1234$",
			parseInt(process.env.m_saltRounds || "10") //  Ensure SALT_ROUNDS is numeric with default value
		),
		emailAddress: "admin@gmail.com", //  Matches schema
		admin: true,
		notifications: [],
		organisedEvents: [],
		avatar: null,
		requests: [],
		invitations: [],
		joinedEvents: [],
} }, { upsert: true })

if ("m_sDev" in process.env) {
	try {
		const tempBucket = getGridFSBucket()
		await tempBucket.drop()
		console.log('Cleared GridFS images')
	} catch (error) {
		if (error.codeName !== 'NamespaceNotFound') {
		console.error('GridFS cleanup error:', error)
		}
	}
}

console.log("Registered collections.")

export default g_coDb