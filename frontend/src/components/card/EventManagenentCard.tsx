import {FC} from "react";
import {Link} from "react-router-dom";

type EventManagementCardProps = {
    _id: string,
    eventName: string,
    eventDescription: string,
    images: string,
    isPublic: boolean,
    joinedUsers: string[],
    eventTime: Date,
    eventLocation: string,
}

const EventManagementCard: FC<EventManagementCardProps> = ({
    _id,
    eventName,
    eventDescription,
    images,
    isPublic,
    joinedUsers,
    eventTime,
    eventLocation,
}) => {
    return (
        <Link to={`/event-detail/${_id}`} className="flex justify-around w-full gap-3 my-4" data-testid="event-card">
            {/* Image Section */}
            <div className="w-60 h-40 overflow-hidden rounded-lg bg-gray-100">
                <img src={`/event/image/${images}`} alt={eventName} className="w-full h-full object-cover" />
            </div>

            {/* Name & Description Section */}
            <div className="flex flex-col flex-grow justify-between">
                <h2 className="text-xl font-semibold" data-testid="event-name">{eventName}</h2>
                <p className="text-gray-600 text-sm line-clamp-2" data-testid="event-description">{eventDescription}</p>
                <div className="text-xs text-gray-500 mt-1">
                    <p data-testid="event-time">{new Date(eventTime).toLocaleString()}</p>
                    <p data-testid="event-location">{eventLocation}</p>
                </div>
            </div>

            {/* Public Status */}
            <div className="flex items-center justify-center w-24 text-sm">
                <span className={`px-2 py-1 rounded-full font-medium ${isPublic ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} data-testid="public-status">
                    {isPublic ? 'Public' : 'Private'}
                </span>
            </div>

            {/* Joined Users Count */}
            <div className="flex items-center justify-center w-24 text-sm text-gray-700">
                {joinedUsers.length} Joined
            </div>

            {/* Event Time */}
            <div className="flex items-center justify-center w-40 text-sm text-gray-500">
                {new Date(eventTime).toLocaleString()}
            </div>
        </Link>
    )
}

export default EventManagementCard;