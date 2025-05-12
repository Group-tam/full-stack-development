import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { fetchSingleEvent, updateEvent } from "../redux/event/singleEventSlice.ts";
import { AppDispatch } from "../redux/store.ts";
import { useAppSelector } from "../hook/hooks.ts";
import EditEventModal from "../components/Modals/EditEventModal.tsx";
import { fetchHandler } from "../utils/fetchHandler";
import { fetchCurrentUser } from "../redux/auth/authSlice";
import { fetchMessages } from "../redux/message/messageSlice";
import EventDetailsCard from "../components/card/EventDetailsCard.tsx";
import EventButtonControl from '../components/EventButtonControl';
import { fetchEventRequest, fetchAllEventRequests, updateRequestStatus, fetchInvitationStatus } from '../redux/rsvp/rsvpSlice';
import type { User, RequestStatus } from "../dataTypes/type";

function EventDetail() {
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	
	// Combined selectors
	const { event: currentEvent, status } = useAppSelector(state => state.singleEvent);
	const { messages } = useAppSelector(state => state.messages);
	const { request, allRequests, invitation } = useAppSelector(state => state.rsvp);
	const currentUser = useAppSelector((state: { auth: { user: User | null } }) => state.auth.user);
	const [isEditing, setIsEditing] = useState(false);

	// Computed values
	const currentUserId = currentUser?._id;
	const isOwner = currentUserId === currentEvent?.organiserID;
	const canInteract = isOwner || 
		(currentEvent?.public && request?.state === "Accepted") ||
		(!currentEvent?.public && invitation?.status === "Accepted");

	// Combined effects
	useEffect(() => {
		if (id) {
			dispatch(fetchSingleEvent(id));
			dispatch(fetchCurrentUser());
		}
	}, [id, dispatch]);

	useEffect(() => {
		if (currentEvent?._id) {
			dispatch(fetchMessages(currentEvent._id));
			dispatch(fetchEventRequest(currentEvent._id));
			dispatch(fetchAllEventRequests(currentEvent._id));
		}
	}, [currentEvent?._id, dispatch]);

	useEffect(() => {
		if (!currentEvent?.public && !isOwner && currentUserId && currentEvent) {
			dispatch(fetchInvitationStatus({ eventName: currentEvent.eventName }));
		}
	}, [currentEvent, isOwner, currentUserId, dispatch]);

	// Early returns
	if (status === "failed") return navigate("/*"), null;
	if (!currentEvent) return null;

	const handleUpdate = async (values: { 
		eventName: string, eventLocation: string, 
		eventDescription: string, eventTime: Date, 
		images: string, newImageFile?: File 
	}) => {
		await dispatch(updateEvent({ id: currentEvent._id, ...values }));
		setIsEditing(false);
	};

	const handleRequestToJoin = async () => {
		const response = await fetchHandler("/request", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ eventId: currentEvent._id }),
		});
		if (response.ok) {
			dispatch(fetchSingleEvent(currentEvent._id));
			dispatch(fetchEventRequest(currentEvent._id));
			dispatch(fetchAllEventRequests(currentEvent._id));
		}
	};

	const handleRequestUpdate = async (requestId: string, newState: RequestStatus) => {
		try {
			await dispatch(updateRequestStatus({ requestId, newState })).unwrap();
			if (currentEvent?._id) {
				dispatch(fetchAllEventRequests(currentEvent._id));
				dispatch(fetchEventRequest(currentEvent._id));
			}
		} catch (error) {
			console.error('Failed to update request:', error);
		}
	};

	const handleInvite = async (userIds: string[]) => {
		try {
			const response = await fetchHandler(`/event/${id}/invite`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userIds }),
			});
			if (response.status === 409) {
				console.log(
					"Some of the invitations in the list have existed already."
				);
				const data = await response.json();
				throw { ...data, duplicateUserIds: data.duplicateUserIds };
			}
			return response.json();
		} catch (error) {
			console.error("Invite failed:", error);
			throw error;
		}
	};

	const handleInform = async (message: string, option: string, minutesBefore?: number) => {
		try {
			const response = await fetchHandler(`/notification/inform`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					eventId: currentEvent._id,
					message,
					option,
					minutesBefore
				})
			});
			
			if (!response.ok) throw new Error('Failed to create notification');
			const data = await response.json();
			console.log("Notification handled:", data);
		} catch (error) {
			console.error("Error handling notification:", error);
		}
	};

	const getStatusMessage = () => {
		if (currentEvent.public) {
			if (isOwner) return null;
			if (request?.state === "Unanswered") return "Your request to join is pending approval";
			if (request?.state === "Rejected") return "Your request to join has been rejected";
			if (request?.state === "Accepted") return "Congrate you are accepted to this event, you can now comment and wait for incomming updates ";
		} else {
			if (invitation?.status === "Pending") return "Invitation is pending your response";
			if (invitation?.status === "Declined") return "You've declined the invitation";
		}
		return null;
	};
	
	const statusMessage = getStatusMessage();

	return (
		<>
			{!currentEvent.public &&
			!isOwner &&
			(!invitation || invitation.status !== "Accepted") ? (
				<div className="flex items-center justify-center h-96">
					<div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
						<div className="text-5xl text-red-500 mb-4">🚫</div>
						<h2 className="text-2xl font-semibold text-gray-800 mb-2">
							Access Denied
						</h2>
						<p className="text-gray-600 mb-4">
							You don't have the permission to view this event.
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
					<div className="lg:col-span-3">
						<EventDetailsCard 
							eventName={currentEvent.eventName}
							eventLocation={currentEvent.eventLocation}
							eventDescription={currentEvent.eventDescription}
							eventTime={currentEvent.eventTime}
							images={currentEvent.images}
							organiserID={currentEvent.organiserID}
							statusMessage={statusMessage}
						/>

						<Link 
							to={`/event-detail/${currentEvent._id}/discussion`}
							className="mt-8 border-t pt-8 block"
						>
							<h2 className="text-2xl font-bold mb-6 hover:text-blue-600 transition-colors">
								Discussion Board →
							</h2>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-gray-600">
									{currentEvent.discussionDescription || 'Click to view or participate in the discussion'}
								</p>
								<div className="mt-4 text-sm text-gray-500">
									{messages.length} messages •{' '}
									{canInteract ? 'Join the conversation' : 'Request access to participate'}
								</div>
							</div>
						</Link> 
					</div>
					<div className="lg:col-span-2">
						<EventButtonControl
							isPublic={currentEvent.public}
							isOwner={isOwner}
							currentUserId={currentUserId ?? ""}
							request={request}
							requests={allRequests}
							onEdit={() => setIsEditing(true)}
							onInvite={handleInvite}
							onRequestToJoin={handleRequestToJoin}
							onRequestUpdate={handleRequestUpdate}
							eventTime={currentEvent.eventTime}
							onInform={handleInform}
						/>
					</div>
				</div>
			)}
			
			<EditEventModal
				show={isEditing}
				onClose={() => setIsEditing(false)}
				initialValues={{
					eventName: currentEvent.eventName,
					eventLocation: currentEvent.eventLocation,
					eventDescription: currentEvent.eventDescription,
					eventTime: currentEvent.eventTime,
					images: currentEvent.images,
				}}
			 // onCancel={() => setIsEditing(false)}
				onSubmit={handleUpdate}
			/>
		</>
	);
}

export default EventDetail;
