import {useAppSelector} from "../hook/hooks.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useEffect} from "react";
import {fetchOwnedEvents} from "../redux/event/ownedEventsSlice.ts";
import EventManagementCard from "../components/card/EventManagenentCard.tsx";
import {fetchJoinedEvents} from "../redux/event/joinedEventSlice.ts";

export default function EventManagementPage() {
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
                 return <div>Error: {ownedError || joinedError}</div>;}
    return (
        <>
        <h1 className="font-bold text-3xl my-4">Owned Events</h1>
        <div className="w-[1000px]">
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
        <div className="w-[1000px]">
            <h1 className="font-bold text-3xl my-4">Joined Events</h1>
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
        </>
    )
}