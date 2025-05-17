import {useAppSelector} from "../hook/hooks.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useEffect, useMemo} from "react";
import {fetchOwnedEvents} from "../redux/event/ownedEventsSlice.ts";
import EventManagementCard from "../components/card/EventManagenentCard.tsx";
import {fetchJoinedEvents} from "../redux/event/joinedEventSlice.ts";
import {fetchUsers} from "../redux/user/usersSlice.ts";
import {searchEvents} from "../utils/eventSearch";

export default function EventManagementPage() {
    const dispatch = useDispatch<AppDispatch>();

    const ownedEvents = useAppSelector(state => state.ownedEvents.events);
    const ownedError = useAppSelector(state => state.ownedEvents.error);
    const joinedEvents = useAppSelector(state => state.joinedEvents.events);
    const joinedError = useAppSelector(state => state.joinedEvents.error);
    const searchCriteria = useAppSelector(state => state.search);
    const filteredOwnedEvents = useMemo(() => {
        return searchEvents(ownedEvents, { ...searchCriteria, filterType: 'owned' });
    }, [ownedEvents, searchCriteria]);

    const filteredJoinedEvents = useMemo(() => {
        return searchEvents(joinedEvents, { ...searchCriteria, filterType: 'joined' });
    }, [joinedEvents, searchCriteria]);

    useEffect(() => {
        dispatch(fetchOwnedEvents());
        dispatch(fetchJoinedEvents());
        dispatch(fetchUsers());
    }, [dispatch]);

    if (ownedError || joinedError) {
        return <div>Error: {ownedError || joinedError}</div>;
    }

    return (
        <>
            <div data-testid="owned-events">
                <h1 className="font-bold text-3xl my-4">Owned Events</h1>
                <div className="w-[1000px]">
                    {filteredOwnedEvents.length > 0 ? (
                        filteredOwnedEvents.map((event) => (
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
                        ))
                    ) : (
                        <p className="text-xl font-semibold mt-8">
                            {searchCriteria.eventName ? "No matching owned events found" : "No owned events"}
                        </p>
                    )}
                </div>
            </div>
            <div data-testid="joined-events">
                <div className="w-[1000px]">
                    <h1 className="font-bold text-3xl my-4">Joined Events</h1>
                    {filteredJoinedEvents.length > 0 ? (
                        filteredJoinedEvents.map((event) => (
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
                        ))
                    ) : (
                        <p className="text-xl font-semibold mt-8">
                            {searchCriteria.eventName ? "No matching joined events found" : "No joined events"}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}