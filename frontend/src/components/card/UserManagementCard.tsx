import {FC} from "react";
import {ShieldCheckIcon} from "@heroicons/react/24/solid";

type UserManagementCardProps = {
    username: string,
    emailAddress: string,
    organisedEvents: string[],
    admin: boolean,
    avatar: string | null,
    joinedEvents: string[],
}
const UserManagementCard: FC<UserManagementCardProps> = ({
        username,
        emailAddress,
        organisedEvents,
        admin,
        avatar,
        joinedEvents,
}) => {
    return (
        <div className="flex justify-around w-full gap-6">
            {/* Image Section */}
            <div className="w-20 h-20 overflow-hidden rounded-full bg-gray-100">
                <img src={(avatar != "000000000000000000000000") ? `/user/image/${avatar}` : '/avatar-default.svg'} alt={username} className="w-full h-full object-cover" />
            </div>

            {/* Username */}
            <div className="flex items-center justify-center w-24 text-sm text-gray-700">
                <span>{username}</span>
                {admin && <ShieldCheckIcon className="w-4 h-4 text-red-500" />}
            </div>

            {/* Email address */}
            <div className="flex items-center justify-center w-24 text-sm text-gray-700">
                {emailAddress}
            </div>

            {/* Organised event amount */}
            <div className="flex flex-col items-center justify-center w-44 text-sm text-gray-700">
                <span>Amount of events organised</span>
                <span>{organisedEvents.length}</span>
            </div>

            {/* Joined event amount */}
            <div className="flex flex-col items-center justify-center w-44 text-sm text-gray-700">
                <span>Amount of events joined</span>
                <span>{joinedEvents.length}</span>
            </div>
        </div>
    )
}

export default UserManagementCard