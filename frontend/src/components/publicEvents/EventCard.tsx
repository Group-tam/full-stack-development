import {FC} from "react";
import {Link} from "react-router-dom";
import {useFetch} from "../../utils/customHooks.ts";

interface OrganizerDetails {
    username: string;
    avatar: string;
    avatarZoom?: number;
}

type EventCardProps = {
    _id: string;
    eventName: string;
    eventLocation: string;
    images: string;
    eventTime: Date;
    organiserID?: string; // Owner ID to fetch owner info
    joinedUsers?: string[]; // Array of joined user IDs
    owned?: boolean //If the current user is the owner of the event
};
const EventCard: FC<EventCardProps> = ({ organiserID, ...props }) => {
  const { data: owner } = useFetch<OrganizerDetails>(`/user/${organiserID}`);

    const formatDate = (date: Date) => { // Format the date to a more readable format
        return new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    return (
        <Link to={`/event-detail/${props._id}`} className="w-[328px] rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer transition-transform duration-200 hover:shadow-md hover:scale-[1.02]">
           
           <div className="h-48 w-full relative">
            <img
                src={`/event/image/${props.images}`}
                alt={props.eventName}
                className="w-full h-full object-cover rounded-t-xl"
            />
            </div>
            <div className="p-4 space-y-1">
                <div className="flex flex-col items-start gap-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {props.eventName}
                    </h3>
                </div>
                <p className="text-xs text-gray-600">
                <span className="inline-block mr-1">📍</span> {props.eventLocation}</p>
                <p className="text-xs text-gray-500">
                <span className="inline-block mr-1">🕒</span>{formatDate(props.eventTime)}</p>
                <p className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {props.joinedUsers?.length || 0} attendees
                </p>
                 {/* Owner information */}
                {owner && (
            <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                        src={(owner.avatar !== "000000000000000000000000")? `/user/image/${owner.avatar}` : '/avatar-default.svg'}
                        alt={owner.username}
                        className="h-full w-full object-cover"
                        style={{
                            transform: `scale(${owner.avatarZoom})`,
                        }}
                    />
                </div>
                <span className="ml-2 text-xs text-gray-500">
                    Organized by <span className="font-medium">{owner.username}</span>
                </span>
            </div>)}
        </div>
        <div>           
            {props.owned && (
            <span data-testid="owned-badge" className="block text-center text-green-600 font-semibold">
                You own this item!
            </span>)}
        </div>
    </Link>)
};

export default EventCard;