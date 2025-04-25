import {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import Navbar from "../components/Navigation/Navbar";
import Sidebar from "../components/Navigation/Sidebar";
import {useDispatch} from "react-redux";
import {fetchSingleEvent, updateEvent} from "../redux/event/singleEventSlice.ts";
import {AppDispatch} from "../redux/store.ts";
import {useAppSelector} from "../hook/hooks.ts";
import {toggle} from "../redux/components/sidebarSlice.ts";
import EditEventModal from "../components/EditEventModal";
import { fetchHandler } from "../utils/fetchHandler"

function EventDetail() {
	const isSidebarOpen = useAppSelector(state => state.sidebar.isOpen)
	const { id } = useParams<{ id: string }>();
	const dispatch = useDispatch<AppDispatch>();
	const currentEvent = useAppSelector(state => state.singleEvent.event);
	const status = useAppSelector(state => state.singleEvent.status);
	const navigate = useNavigate();

	const toggleSidebar = () => dispatch(toggle())

	const [searchParams] = useSearchParams();
	const ownedPara = searchParams.get("owned");

	  // modal state
	 const [isEditing, setIsEditing] = useState(false);
	useEffect(() => {
		if (id) dispatch(fetchSingleEvent(id))
	}, [id, dispatch])

	if (status === 'failed') navigate('/*')
	if (!currentEvent) return null
	const openEdit = () => setIsEditing(true)
	const closeEdit = () => setIsEditing(false)

	const handleUpdate = async (values: { eventName: string; eventLocation: string; eventDescription: string }) => {
	await dispatch(updateEvent({ id: currentEvent._id, ...values }));
	console.log("DanaBook");
	closeEdit();
  };
	//So now we can get the ownedPara from the URL and use it to determine if the event is owned or not
	const [l_coInvitation, l_coSetL_coInvitation] = useState<{ state: "Accepted" | "Unanswered" | "Rejected" } | null>(null)
	useEffect(() => {
		(async function() {
			document.cookie = "m_sEvent=" + currentEvent._id
			const l_coResponse = await fetchHandler("/request", {
				method: "GET",
				credentials: "include"
			})
			if (l_coResponse.ok) l_coSetL_coInvitation(await l_coResponse.json()); else console.error("Error fetching requests.")
		})()
	})

	return (
		<>
		
		<div className="flex">
			<Sidebar isOpen={isSidebarOpen} />
			<div className="flex-1">
				<Navbar toggleSidebar={toggleSidebar} />
				<main className="mt-16 px-4 py-8">
					<div className="max-w-7xl mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Main Event Content */}
							<div className="lg:col-span-2">
								<img
									src={`/event/image/${currentEvent.images}`}
									alt={currentEvent.eventName}
									className="w-full h-96 object-cover rounded-lg mb-6"
								/>
								<h1 className="text-3xl font-bold mb-2">
									{currentEvent.eventName}
								</h1>
								<div className="flex items-center mb-4">
									<img
										src={"/avatar-default.svg"}
										alt={"Host Image"}
										className="h-8 w-8 rounded-full mr-2"
									/>
									<span className="text-gray-700">John Doe</span>
								</div>
								<div className="mb-6">
									<p className="text-gray-600">{currentEvent.eventLocation}</p>
									<p className="text-gray-600">{currentEvent.eventTime.toString()}</p>
								</div>
								<div className="mb-8">
									<h2 className="text-2xl font-bold mb-4">Description</h2>
									<p className="text-gray-700 whitespace-pre-line">
										{currentEvent.eventDescription}
									</p>
								</div>
							</div>

							{/* Sidebar Content */}
							<div className="lg:col-span-1">
								<div className="bg-white p-6 rounded-lg shadow-md mb-6">
								{ownedPara === "true" ? (
										<button  onClick={openEdit}
										className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
											Edit Event Details
										</button>
										) : l_coInvitation ? (
											l_coInvitation.state === "Accepted" ? (<button>Discussion board</button>) :
											l_coInvitation.state === "Unanswered" ? (<p>Request not answered</p>) :
											l_coInvitation.state === "Rejected" ? (<p>Request rejected</p>) :
											(<p>Invalid invitation state</p>)
										) : (
										<button onClick={ async function() {
											alert((await fetchHandler("/request", {
												method: "POST",
												credentials: "include"
											})).ok ? "Success." : "Failure.")
										} }
										className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-6 rounded-full transition-colors">
											Request to join
										</button>
										)}
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
		  {/* Edit Modal */}
	  {isEditing && (
		<EditEventModal
		  initialValues={{
			eventName: currentEvent.eventName,
			eventLocation: currentEvent.eventLocation,
			eventDescription: currentEvent.eventDescription,
		  }}
		  onCancel={closeEdit}
		  onSubmit={handleUpdate}
		/>
	  )}
		</>
	);
}

export default EventDetail;