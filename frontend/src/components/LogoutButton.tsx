import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/auth/authSlice.ts';
import { fetchHandler } from "../utils/fetchHandler.ts";

interface LogoutButtonProps {
    className?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export default function LogoutButton({ className = "", icon, children }: LogoutButtonProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetchHandler('/log/out', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                dispatch(logout());
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button
            data-testid="logout-button" 
            onClick={handleLogout}
            className={className}
        >
            {icon}
            {children ?? "Logout"}
        </button>
    );
}