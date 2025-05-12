import { Outlet } from 'react-router-dom'
import { useAppSelector } from "../hook/hooks.ts"
import { useDispatch } from "react-redux"
import { AppDispatch } from "../redux/store.ts"
import { toggle } from "../redux/components/sidebarSlice.ts"
import Navbar from "../components/navigation/Navbar"
import Sidebar from "../components/navigation/Sidebar"

export default function MainLayout() {
	const isSidebarOpen = useAppSelector(state => state.sidebar.isOpen)
	const dispatch = useDispatch<AppDispatch>()
	const toggleSidebar = () => dispatch(toggle())

	return (
		<div className="flex">
			<Sidebar isOpen={isSidebarOpen} />
			<div className="flex-1">
				<Navbar toggleSidebar={toggleSidebar} />
				<main className={`mt-20 transition-all duration-300 ${
					isSidebarOpen ? "ml-72" : "ml-8" }`}>
					<Outlet />
				</main>
			</div>
		</div>
	)
}