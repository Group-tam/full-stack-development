import EventCard from "../components/publicEvents/EventCard.tsx";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useAppSelector} from "../hook/hooks.ts";
import {useEffect, useMemo} from "react";
import {fetchPublicEvents} from "../redux/event/publicEventSlice.ts";
import {fetchOwnedEvents} from "../redux/event/ownedEventsSlice.ts";
import {fetchUsers} from "../redux/user/usersSlice.ts";
import {searchEvents} from "../utils/eventSearch";
import {Event} from "../dataTypes/type";


export default function PublicEventPage() {
    const dispatch = useDispatch<AppDispatch>();

    const events = useAppSelector(state => state.publicEvent.events);
    const error = useAppSelector(state => state.publicEvent.error);
    const ownedEvents = useAppSelector(state => state.ownedEvents.events);
    const searchCriteria = useAppSelector(state => state.search);

    // Filter events based on search criteria
    const filteredEvents = useMemo(() => {
        return searchEvents(events, searchCriteria);
    }, [events, searchCriteria]);

    useEffect(() => {
        dispatch(fetchPublicEvents());
        dispatch(fetchOwnedEvents());
        dispatch(fetchUsers());
    }, [dispatch]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <h1 className="font-bold text-3xl">Public Events</h1>
            <div data-testid="event-card" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
                {filteredEvents.length > 0 ? 
                    filteredEvents.map((event: Event) => (
                        <EventCard
                            key={event._id}
                            _id={event._id}
                            eventName={event.eventName}
                            images={event.images}
                            eventLocation={event.eventLocation}
                            eventTime={event.eventTime}
                            organiserID={event.organiserID}
                            joinedUsers={event.joinedUsers}
                            owned={ownedEvents.some(item => item._id === event._id)}
                        />
                    ))
                : (
                    <h2 className="text-xl font-semibold">
                        {searchCriteria.eventName ? "No matching events found" : "No events available"}
                    </h2>
                )}
            </div>
        </>
    );
}