import {useAppSelector} from "../hook/hooks.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useEffect} from "react";
import {fetchOwnedEvents} from "../redux/event/ownedEventsSlice.ts";
import {toggle} from "../redux/components/sidebarSlice.ts";
import Sidebar from "../components/Navigation/Sidebar.tsx";
import Navbar from "../components/Navigation/Navbar.tsx";
import EventManagementCard from "../features/eventManagement/EventManagenentCard.tsx";
import {fetchJoinedEvents} from "../redux/event/joinedEventSlice.ts";

export default function EventManagementPage() {
    const isSidebarOpen = useAppSelector(state => state.sidebar.isOpen)
    const dispatch = useDispatch<AppDispatch>();

    const ownedEvents = useAppSelector(state => state.ownedEvents.events);
    const ownedError = useAppSelector(state => state.ownedEvents.error);

    const joinedEvents = useAppSelector(state => state.joinedEvents.events);
    const joinedError = useAppSelector(state => state.joinedEvents.error);

    useEffect(() => {
        dispatch(fetchOwnedEvents());
        dispatch(fetchJoinedEvents());
    }, [dispatch]);

    if (ownedError || joinedError) {
        return <div>Error: {ownedError || joinedError}</div>;
    }

    console.log(ownedEvents);

    const toggleSidebar = () => dispatch(toggle())

    return (
        <div className="flex">
            <Sidebar isOpen={isSidebarOpen} />
            <div>
                <Navbar toggleSidebar={toggleSidebar} />
                <div className={`mt-20 ml-10 flex flex-col gap-y-4 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-8'}`}>
                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-3xl">Owned Events</h1>
                        {ownedEvents.map(event => {
                            return (
                                <EventManagementCard
                                    key={event._id}
                                    _id={event._id}
                                    eventName={event.eventName}
                                    eventDescription={event.eventDescription}
                                    images={event.images}
                                    isPublic={event.public}
                                    eventLocation={event.eventLocation}
                                    eventTime={event.eventTime}
                                    joinedUsers={event.joinedUsers}

                                />
                            )
                        })
                        }
                    </div>
                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-2xl">Joined Events</h1>
                        {joinedEvents.map(event => {
                            return (
                                <EventManagementCard
                                    key={event._id}
                                    _id={event._id}
                                    eventName={event.eventName}
                                    eventDescription={event.eventDescription}
                                    images={event.images}
                                    isPublic={event.public}
                                    eventLocation={event.eventLocation}
                                    eventTime={event.eventTime}
                                    joinedUsers={event.joinedUsers}

                                />
                            )
                        })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}