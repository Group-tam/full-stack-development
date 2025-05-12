import {useAppDispatch, useAppSelector} from "../hook/hooks.ts";
import {useEffect, useState} from "react";
import {fetchGlobalSetting} from "../redux/admin/globalSettingSlice.ts";
import {PencilSquareIcon} from "@heroicons/react/24/solid";
import SettingsCard from "../components/admin/SettingsCard.tsx";
import {fetchEvents} from "../redux/event/eventsSlice.ts";
import {fetchUsers} from "../redux/user/usersSlice.ts";
import {Link} from "react-router-dom";

export default function AdminDashboardPage() {
    const [isSettingsCardOpen, setIsSettingsCardOpen] = useState(false);

    const openSettingsCard = () => setIsSettingsCardOpen(true);
    const closeSettingsCard = () => setIsSettingsCardOpen(false);

    const dispatch = useAppDispatch();

    const settings = useAppSelector(state => state.globalSetting.settings);
    const events = useAppSelector(state => state.events.events);
    const users = useAppSelector(state => state.users.users);

    useEffect(() => {
        dispatch(fetchGlobalSetting())
        dispatch(fetchEvents())
        dispatch(fetchUsers())
    }, [dispatch]);

    return (
        <>
            <h1 className={"font-bold text-3xl"}>Admin Dashboard</h1>
            <div>
                <span className="flex items-center space-x-2">
                    <h1 className="font-bold text-2xl">Global Setting</h1>
                    <button className="cursor-pointer"><PencilSquareIcon height={32} width={32}
                    onClick={openSettingsCard}/></button>
                </span>
                <h2 className="text-xl">Maximum amount of active events a user can
                    create: {settings ? settings.eventLimit : "Loading..."}</h2>
                <h2 className="text-xl">Maximum amount of invitations that can be
                    sent: {settings ? settings.invitationLimit : "Loading..."}</h2>
                {isSettingsCardOpen && <SettingsCard onClose={closeSettingsCard}/>}
            </div>
            <div>
                <h1 className="font-bold text-2xl">User statistics</h1>
                <h2 className="text-xl">Total number of users: {users ? users.length : "Loading..."}</h2>
                <h2 className="text-xl">Number of users who are currently hosting events: {users ? users.filter(user => user.organisedEvents.length > 0).length : "Loading..."}</h2>
                <h2 className="text-xl">Number of users who are current attending events: {users ? users.filter(user => user.joinedEvents.length > 0).length : "Loading..."}</h2>
                <h2 className="text-xl">Number of admins: {users ? users.filter(user => user.admin).length : "Loading..."}</h2>
                <Link to="/admin-dashboard/all-user-dashboard" className="text-xl text-blue-500 hover:text-blue-600 transition duration-200 cursor-pointer">View all users</Link>
            </div>
            <div>
                <h1 className="font-bold text-2xl">Event statistics</h1>
                <h2 className="text-xl">Total number of events: {events ? events.length : "Loading..."}</h2>
                <h2 className="text-xl">Number of public events: {events ? events.filter(event => event.public).length : "Loading..."}</h2>
                <h2 className="text-xl">Number of private events: {events ? events.filter(event => !event.public).length : "Loading..."}</h2>
                <Link to="/admin-dashboard/all-event-dashboard" className="text-xl text-blue-500 hover:text-blue-600 transition duration-200 cursor-pointer">View all events</Link>
            </div>
        </>
    )

}