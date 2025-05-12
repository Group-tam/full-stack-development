import { ObjectId } from "mongodb"
import { getGridFSBucket } from "./gridfs.ts"
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_AVATAR_ID = new ObjectId("000000000000000000000000")
const DEFAULT_AVATAR_PATH = path.join(__dirname, '../../frontend/public/avatar-default.svg')

export async function initializeDefaultAvatar() {
  const bucket = getGridFSBucket()
  
  // Cleanup existing avatar if exists
  try {
    await bucket.delete(DEFAULT_AVATAR_ID)
  } catch (error) {
    // Handle "file not found" error specifically
    if (error.message.includes("File not found")) {
      console.log('No existing avatar to delete')
    } else {
      console.error('Cleanup error:', error)
    }
  }

  // Upload new avatar
  try {
    const stream = fs.createReadStream(DEFAULT_AVATAR_PATH)
    const uploadStream = bucket.openUploadStreamWithId(
      DEFAULT_AVATAR_ID,
      'avatar-default.svg',
      { contentType: 'image/svg' }
    )
    
    await new Promise((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve)
    })
    console.log('Default avatar initialized successfully')
  } catch (error) {
    console.error('Avatar upload failed:', error)
  }
}