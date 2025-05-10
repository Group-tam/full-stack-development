import {useFetch} from "../utils/customHooks.ts";

interface EventDetailsCardProps {
  eventName: string;
  eventLocation: string;
  eventDescription: string;
  eventTime: Date;
  images: string;
  organiserID: string;
  statusMessage?: string | null;
}

export default function EventDetailsCard({ organiserID, ...props }: EventDetailsCardProps) {
  const { data: organizer } = useFetch<{username: string; avatar: string; avatarZoom: number}>(`/user/${organiserID}`);
  
  return (
    <div className="lg:col-span-2">
      <img
        src={`/event/image/${props.images}`}
        alt={props.eventName}
        className="w-full h-96 object-cover rounded-lg mb-6 shadow-lg"
      />
      
      {props.statusMessage && (
        <div className={`p-4 rounded-lg mb-4 border ${
        props.statusMessage.includes("rejected")
          ? "bg-red-100 border-red-200 text-red-800"
          : props.statusMessage.includes("pending approval")
          ? "bg-yellow-100 border-yellow-200 text-yellow-800"
          : props.statusMessage.includes("Congrate")
          ? "bg-green-100 border-green-200 text-green-800"
          : "bg-yellow-100 border-yellow-200 text-yellow-800"
       }`}>
          <p className="text-center">{props.statusMessage}</p>
        </div>
)}

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {props.eventName}
        </h1>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {organizer && (
            <div className="flex items-center space-x-4 pb-6 border-b">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-sm">
                  <img
                    src={`/user/image/${organizer.avatar}`}
                    alt={`${organizer.username}'s avatar`}
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${organizer.avatarZoom})` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organized by</p>
                <p className="font-medium text-gray-900">{organizer.username}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">🌍 Location</h3>
              <p className="text-gray-900">{props.eventLocation}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">🕐 Date & Time</h3>
              <p className="text-gray-900">
                {new Date(props.eventTime).toLocaleString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {props.eventDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}