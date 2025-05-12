import EventCard from "../components/publicEvents/EventCard.tsx";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useAppSelector} from "../hook/hooks.ts";
import {useEffect} from "react";
import {fetchPublicEvents} from "../redux/event/publicEventSlice.ts";
import {fetchOwnedEvents} from "../redux/event/ownedEventsSlice.ts";


export default function PublicEventPage() {
    const dispatch = useDispatch<AppDispatch>();

    const events = useAppSelector(state => state.publicEvent.events);
    const error = useAppSelector(state => state.publicEvent.error);

    const ownedEvents = useAppSelector(state => state.ownedEvents.events);

    useEffect(() => {
        dispatch(fetchPublicEvents());
    }, [dispatch]);
    useEffect(() => {
        dispatch(fetchOwnedEvents());
    }, [dispatch]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
    <>
        <h1 className={"font-bold text-3xl"}>Public Events</h1>
        <div data-testid="event-card" className={"flex flex-wrap gap-10"}>
            {events.length > 0 ? (
                <div data-testid="event-card" className={"flex flex-wrap gap-10 mt-8"}>
                    {events.map(event => (
                        <EventCard
                            key={event._id}
                            _id={event._id}
                            eventName={event.eventName}
                            images={event.images}
                            eventLocation={event.eventLocation}
                            eventTime={event.eventTime}
                            organiserID={event.organiserID}
                            joinedUsers={event.joinedUsers || []}
                            owned={ownedEvents.some(item => item._id === event._id)}
                        />
                    ))}
                </div>
            ) : (
                <h2 className="text-xl font-semibold mt-8" data-testid="no-events-message">
                    No events available
                </h2>
            )}
        </div>
    </>
    )
}