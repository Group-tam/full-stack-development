import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Event} from "../../dataTypes/type.ts";
import {fetchHandler} from "../../utils/fetchHandler.ts";

interface SingleEventState {
	event: Event | null
	loading: boolean
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null
}

const initialState: SingleEventState = {
	event: null,
	loading: false,
	status: 'idle',
	error: null
}

export const fetchSingleEvent = createAsyncThunk(
	'singleEvent/fetch',
	async (_id: string, thunkAPI) => {
		try {
				// Fetch public events
				const res = await fetchHandler(`/event?_id=${_id}`, { credentials: 'include', method: 'GET' })
				if (!res.ok) throw new Error("Failed to fetch public events")
				return (await res.json())[0]
		} catch (err) {
				console.error(err);
				return thunkAPI.rejectWithValue("Something went wrong while fetching public events.")
		}
	}
)

export const updateEvent = createAsyncThunk<
	Event,
	{ id: string; eventName: string; eventLocation: string; eventDescription: string;
		eventTime: Date; images: string; newImageFile?: File;},
	{ rejectValue: string }
>(
	'singleEvent/update',
	async ({ id, images, newImageFile, ...updateData }, thunkAPI) => {
		try {
			let imageId = images;
			let oldImageId: string | null = null;
			if (newImageFile) {
				const formData = new FormData();
				formData.append('image', newImageFile);
				const uploadRes = await fetchHandler(`/event/image`, {
					method: 'POST',
					body: formData,
			}); if (!uploadRes.ok) throw new Error('Image upload failed');
			const { imageId: newId } = await uploadRes.json();
			oldImageId = images; // Store old ID before updating
			imageId = newId;}

			// PUT at /event/:id
			const res = await fetchHandler(`/event/${id}`, {
				credentials: 'include',
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				body: JSON.stringify({  ...updateData, images: imageId, eventTime: new Date(updateData.eventTime).toISOString() }),
			});
			if (!res.ok) throw new Error('Event update failed');
			// Delete old image ONLY after successful update
			console.log(oldImageId)
			if (oldImageId && oldImageId !== imageId) {
				const deleteRes = await fetchHandler(`/event/image/${oldImageId}`, {
					method: 'DELETE',
				});
				
				if (!deleteRes.ok) {
					console.error('Failed to delete old image, but event was updated');
				}
			}
	 
			return (await res.json()) as Event;
		} catch (err) {
			console.error(err);
			return thunkAPI.rejectWithValue('Update failed.');
		}
	}
)

const singleEventSlice = createSlice({
	name: 'singleEvent',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
				.addCase(fetchSingleEvent.pending, state => {
						state.status = 'loading';
						state.loading = true
						state.error = null
				})
				.addCase(fetchSingleEvent.fulfilled, (state, action) => {
						state.status = 'succeeded';
						state.loading = false
						state.event = action.payload
				})
				.addCase(fetchSingleEvent.rejected, (state, action) => {
						state.status = 'failed';
						state.loading = false
						state.error = action.payload as string
				})
			
		builder
		.addCase(updateEvent.pending, (state) => {
						state.status = 'loading';
						state.error = null;
		})
		.addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
						state.status = 'succeeded';
						state.event = action.payload; 
		})
		.addCase(updateEvent.rejected, (state, action) => {
						state.status = 'failed';
						state.error = action.payload as string;
		});    
	}
})

export default singleEventSlice.reducer
