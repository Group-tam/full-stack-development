import {useAppSelector} from "../hook/hooks.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useEffect} from "react";
import {fetchEvents} from "../redux/event/eventsSlice.ts";
import EventManagementCard from "../components/card/EventManagenentCard.tsx";

export default function AllEventDashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const events = useAppSelector(state => state.events.events);

    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch]);

    return (
        <>
            <h1 className="font-bold text-3xl">All Events</h1>
            {events.map(event => {
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
        </>
    )
}