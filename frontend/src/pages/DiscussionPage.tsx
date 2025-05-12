import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hook/hooks';
import DiscussionBoard from '../components/DiscussionBoard/DiscussionBoard';
import { fetchSingleEvent } from '../redux/event/singleEventSlice';
import { fetchMessages,updateDiscussionDescription } from '../redux/message/messageSlice';
import { fetchCurrentUser } from '../redux/auth/authSlice';
import { fetchEventRequest, fetchInvitationStatus } from '../redux/rsvp/rsvpSlice';
import type { User } from "../dataTypes/type";


export default function DiscussionPage() {
	const { id } = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	// Redux selectors
	const { event: currentEvent, status } = useAppSelector(state => state.singleEvent);
	const { messages } = useAppSelector(state => state.messages);
	const { request, invitation } = useAppSelector(state => state.rsvp);
	const currentUser = useAppSelector((state: { auth: { user: User | null } }) => state.auth.user);

	// Fetch initial data
	useEffect(() => {
		if (id) {
			dispatch(fetchSingleEvent(id));
			dispatch(fetchCurrentUser());
		}
	}, [id, dispatch]);

	// Fetch messages and requests
	useEffect(() => {
		if (currentEvent?._id) {
			dispatch(fetchMessages(currentEvent._id));
			dispatch(fetchEventRequest(currentEvent._id));
		}
	}, [currentEvent?._id, dispatch]);

	// Check invitation status
	useEffect(() => {
		if (!currentEvent?.public && currentUser?._id && currentEvent) {
			dispatch(fetchInvitationStatus({ eventName: currentEvent.eventName }));
		}
	}, [currentEvent, currentUser, dispatch]);

	// Derived values
	const isOwner = currentUser?._id === currentEvent?.organiserID;
	const canInteract = isOwner || 
		(currentEvent?.public && request?.state === "Accepted") ||
		(!currentEvent?.public && invitation?.status === "Accepted");

	if (status === "failed") return navigate("/*"), null;
	if (!currentEvent) return null;

	return (
		<DiscussionBoard
			eventId={currentEvent._id}
			isOwner={isOwner}
			canInteract={canInteract}
			currentDescription={currentEvent.discussionDescription}
			messages={messages}
			onUpdateDescription={async function(description) {
				await dispatch(updateDiscussionDescription({ 
					eventId: currentEvent._id, 
					description 
				}));
				dispatch(fetchSingleEvent(currentEvent._id));
			}}
		/>
	);
}