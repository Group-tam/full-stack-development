import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchHandler } from "../../utils/fetchHandler";
import type { RootState } from "../store";

interface Message {
	_id: string;
	text: string;
	senderId: string;
	eventId: string;
	parentMessageId?: string;
	createdAt: Date;
	updatedAt?: Date;
	user?: {
		_id: string;
		username: string;
		avatar: string;
		avatarZoom: number;
	};
	isOrganizer?: boolean;
}

interface MessageState {
	messages: Message[];
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

const initialState: MessageState = {
	messages: [],
	status: 'idle',
	error: null
};

export const fetchMessages = createAsyncThunk(
	'messages/fetch',
	async (eventId: string) => {
		const res = await fetchHandler(`/message?eventId=${eventId}`, { 
			method: 'GET',
			credentials: 'include'
		});
		return await res.json();
	}
);

export const createMessage = createAsyncThunk(
	'messages/create',
	async (payload: { eventId: string; text: string; parentMessageId?: string }) => {
		const res = await fetchHandler(`/message`, {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			credentials: 'include',
			body: JSON.stringify({
				eventId: payload.eventId,
				text: payload.text,
				parentMessageId: payload.parentMessageId,
		}),
		});
		return await res.json();
	}
);

export const updateMessage = createAsyncThunk(
	'messages/update',
	async (payload: { messageId: string; text: string }) => {
		const res = await fetchHandler(`/message`, {
			method: 'PUT',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			credentials: 'include'
		});
		return await res.json();
	}
);

export const deleteMessage = createAsyncThunk(
	'messages/delete',
	async (messageId: string) => {
		await fetchHandler(`/message`, {
			method: 'DELETE',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ messageId }),
			credentials: 'include'
		});
		return messageId;
	}
);

export const updateDiscussionDescription = createAsyncThunk(
	'messages/updateDiscussionDescription',
	async ({ eventId, description }: { eventId: string; description: string }) => {
		const res = await fetchHandler(`/event/${eventId}/discussion`, {
			method: 'PUT',
			headers: { "Content-Type": "application/json" },
			credentials: 'include',
			body: JSON.stringify({ description }),
		});
		if (!res.ok) {
			throw new Error('Failed to update description');
		}
		return description; 
	}
);

const messageSlice = createSlice({
	name: 'messages',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMessages.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchMessages.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.messages = action.payload;
			})
			.addCase(fetchMessages.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message || 'Failed to fetch messages';
			})
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.addCase(createMessage.fulfilled, (_state, _action) => {})
			.addCase(updateMessage.fulfilled, (state, action) => {
				const index = state.messages.findIndex(m => m._id === action.payload._id);
				if (index !== -1) state.messages[index] = action.payload;
			})
			.addCase(deleteMessage.fulfilled, (state, action) => {
				state.messages = state.messages.filter(m => m._id !== action.payload);
			});
	}
});

export default messageSlice.reducer;

export const selectMessagesByEvent = (state: RootState) => 
	state.messages.messages.filter(m => m.eventId === state.singleEvent.event?._id);