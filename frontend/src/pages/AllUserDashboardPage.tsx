import {useAppSelector} from "../hook/hooks.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../redux/store.ts";
import {useEffect} from "react";
import {fetchUsers} from "../redux/user/usersSlice.ts";
import UserManagementCard from "../components/card/UserManagementCard.tsx";

export default function AllUsersDashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const users = useAppSelector(state => state.users.users);

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch]);

    return (
        <>
            <h1 className="font-bold text-3xl">All Users</h1>
            {users.map(user => {
                return (
                    <UserManagementCard
                        key={user._id}
                        username={user.username}
                        emailAddress={user.emailAddress}
                        organisedEvents={user.organisedEvents}
                        avatar={user.avatar}
                        joinedEvents={user.joinedEvents}
                        admin={user.admin}
                    />
                )
            })
            }          
        </>
    )
}