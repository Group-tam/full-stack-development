/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { fetchHandler } from "../utils/fetchHandler";
import { Tooltip } from "./Tooltip";
import {useFetch} from "../utils/customHooks.ts";

interface ResponseItem {
	_id: string;
	type: "request" | "invitation" | "sent_invitation" | "sent_request";
	eventName: string;
	username: string; 
	status: string;
	eventTime: Date;
}

const RSVPTable = () => {
	const [responses, setResponses] = useState<ResponseItem[]>([]);
	const { data: requestsData } = useFetch<any[]>('/request/organizer-responses');
	const { data: invitationsData } = useFetch<any[]>('/invitation/user-invitations');
	const { data: sentRequestsData } = useFetch<any[]>('/request/my-requests');
	const { data: sentInvitationsData } = useFetch<any[]>('/invitation/sent-invitations');

	// Format the responses into ResponseItem objects
	useEffect(() => {
		if (requestsData && invitationsData && sentRequestsData && sentInvitationsData) {
			const formattedResponses = [
				...requestsData.map((r: any) => ({
					...r,
					type: "request",
					eventTime: new Date(r.eventTime)
				})),
				...invitationsData.map((i: any) => ({
					...i,
					type: "invitation",
					eventTime: new Date(i.eventTime)
				})),
				...sentRequestsData.map((sr: any) => ({
					...sr,
					type: "sent_request",
					eventTime: new Date(sr.eventTime)
				})),
				...sentInvitationsData.map((si: any) => ({
					...si,
					type: "sent_invitation",
					eventTime: new Date(si.eventTime)
				}))
			];
			setResponses(formattedResponses); //setting the responses state for later visual processing
		}
	}, [requestsData, invitationsData, sentRequestsData, sentInvitationsData]);
	// Accept/Reject/Decline handler
	const handleResponse = async (id: string, type: ResponseItem['type'], newStatus: string) => {
		if (type !== 'request' && type !== 'invitation') return;
		
		try {
			const endpoint = type === 'request' ? 'request' : 'invitation';
			await fetchHandler(`/${endpoint}/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ state: newStatus })
			});
			setResponses(responses.map(r =>
				r._id === id ? { ...r, status: newStatus } : r
			));
		} catch (error) {
			console.error("Failed to update response:", error);
		}
	};

	return (
		<div className="rounded-lg border border-gray-200 shadow-lg w-full" data-testid="rsvp-table">
			<table className="w-full divide-y divide-gray-200">
				<thead className="bg-gradient-to-r from-[#0047BA] to-[#409CE3]"> 
					<tr>
						<th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-24">Type</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-64">Event</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-48">
							{/* Dynamic header based on type */}
							FROM/TO
						</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-32">Status</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-48">Event Date</th>
						<th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{responses.map((response) => (
						<tr 
							key={response._id}
							className={`${
								response.type === 'invitation' ? 'bg-red-100 border-l-4 border-red-500' :
								response.type === 'request' ? 'bg-green-100 border-l-4 border-green-500' :
								response.type === 'sent_invitation' ? 'bg-blue-100 border-l-4 border-blue-500' :
								'bg-purple-100 border-l-4 border-purple-500'
							}`}
						>
							{/* Type */}
							<td className={`px-4 py-3 text-sm font-medium ${
								response.type === 'invitation' ? 'text-red-700' :
								response.type === 'request' ? 'text-green-700' :
								response.type === 'sent_invitation' ? 'text-blue-700' :
								'text-purple-700'
							} capitalize`}>
								{response.type.replace('_', ' ')}
							</td>
							
						 {/* Event Name */}
						 <td className="px-4 py-3 text-sm text-gray-900 font-semibold max-w-[200px]">
								<Tooltip content={response.eventName} direction="top">
									<span className="truncate block max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{response.eventName}</span>
								</Tooltip>
							</td>
							
							{/* From/To */}
							<td className="px-4 py-3 text-sm text-gray-600 max-w-[150px]">
								<Tooltip content={response.username} direction="top">
									<span className="truncate block max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{response.username}</span>
								</Tooltip>
							</td>
							
							{/* Status */}
							<td className="px-4 py-3 text-sm">
								<span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
									response.status === "Accepted" ? "bg-green-500 text-white" :
									response.status === "Declined" || response.status === "Rejected" ? "bg-red-500 text-white" :
									"bg-yellow-500 text-white"
								}`}>
									{response.status}
								</span>
							</td>
							
							{/* Event Date */}
							<td className="px-4 py-3 text-sm text-gray-500">
								{response.eventTime.toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</td>
							
							{/* Only show for received requests/invitations */}
							<td className="px-4 py-3 text-sm">
								{(response.type === 'request' || response.type === 'invitation') && 
								 (response.status === "Pending" || response.status === "Unanswered") && (
									<div className="flex gap-2">
										<button
											onClick={() => handleResponse(response._id, response.type, "Accepted")}
											className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
										>
											Accept
										</button>
										<button
											onClick={() => handleResponse(response._id, response.type, response.type === "request" ? "Rejected" : "Declined")}
											className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
										>
											Reject
										</button>
									</div>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default RSVPTable;