import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {Event} from "../../dataTypes/type.ts";
import {fetchHandler} from "../../utils/fetchHandler.ts";

interface EventState {
    events: Event[]
    loading: boolean
    error: string | null
}

const initialState: EventState = {
    events: [],
    loading: false,
    error: null
}

export const fetchJoinedEvents = createAsyncThunk(
    'joinedEvents/fetch',
    async (_, thunkAPI) => {
        try {
            // Fetch public events
            const res = await fetchHandler(`/event/joined`, { credentials: 'include', method: 'GET' })
            if (!res.ok) throw new Error("Failed to fetch joined events")
            return await res.json()
        } catch (err) {
            console.error(err);
            return thunkAPI.rejectWithValue("Something went wrong while fetching joined events.")
        }
    }
)

const joinedEventSlice = createSlice({
    name: 'joinedEvents',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchJoinedEvents.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchJoinedEvents.fulfilled, (state, action) => {
                state.loading = false
                state.events = action.payload
            })
            .addCase(fetchJoinedEvents.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    }
})

export default joinedEventSlice.reducer
