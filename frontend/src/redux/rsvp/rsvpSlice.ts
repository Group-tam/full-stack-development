import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchHandler } from '../../utils/fetchHandler';
import { Request, RequestStatus } from '../../dataTypes/type';

interface RSVPState {
	request: { state: "Accepted" | "Unanswered" | "Rejected" } | null;
	allRequests: Request[];
	invitation: { status: "Accepted" | "Pending" | "Declined" } | null;
	loading: boolean;
	error: string | null;
}

const initialState: RSVPState = {
	request: null,
	allRequests: [],
	invitation: null,
	loading: false,
	error: null
};

export const fetchEventRequest = createAsyncThunk(
	'rsvp/fetchEventRequest',
	async (eventId: string) => {
		const response = await fetchHandler(`/request?eventId=${eventId}`, {
			method: "GET",
			credentials: "include"
		});
		if (!response.ok) throw new Error('Failed to fetch request');
		return response.json();
	}
);

export const fetchAllEventRequests = createAsyncThunk(
	'rsvp/fetchAllEventRequests',
	async (eventId: string) => {
		const response = await fetchHandler(`/request?eventId=${eventId}&all=true`, {
			method: "GET",
			credentials: "include"
		});
		if (!response.ok) throw new Error('Failed to fetch all requests');
		return response.json();
	}
);

export const fetchInvitationStatus = createAsyncThunk(
	'rsvp/fetchInvitationStatus',
	async ({ eventName }: { eventName: string }) => {
		const response = await fetchHandler(`/invitation/user-invitations`);
		if (!response.ok) throw new Error('Failed to fetch invitation status');
		const invitations = await response.json();
		return invitations.find(
			(inv: { eventName: string; status: string }) => 
			inv.eventName === eventName
		) || null;
	}
);

export const updateRequestStatus = createAsyncThunk(
	'rsvp/updateRequestStatus',
	async ({ requestId, newState }: { requestId: string; newState: RequestStatus }) => {
		const response = await fetchHandler("/request", {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ requestId, newState }),
		});
		if (!response.ok) throw new Error('Failed to update request');
		return { requestId, newState };
	}
);

const rsvpSlice = createSlice({
	name: 'rsvp',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEventRequest.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchEventRequest.fulfilled, (state, action) => {
				state.loading = false;
				state.request = action.payload;
			})
			.addCase(fetchEventRequest.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || null;
			})
			.addCase(fetchAllEventRequests.fulfilled, (state, action) => {
				state.allRequests = action.payload;
			})
			.addCase(fetchInvitationStatus.fulfilled, (state, action) => {
				state.invitation = action.payload;
			})
			.addCase(updateRequestStatus.fulfilled, (state, action) => {
				if (state.allRequests) {
					state.allRequests = state.allRequests.map(request => 
						request._id === action.payload.requestId 
							? { ...request, state: action.payload.newState as RequestStatus }
							: request
					);
				}
			});
	}
});

export default rsvpSlice.reducer;