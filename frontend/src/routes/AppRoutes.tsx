import {createBrowserRouter} from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import LoginPage from "../pages/LoginPage.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import NotFound from "../pages/NotFound.tsx";
import EventDetail from "../pages/EventPage.tsx";
import DiscussionPage from "../pages/DiscussionPage.tsx";
import PublicEventPage from "../pages/PublicEventPage.tsx";
import CreateEventPage from "../pages/CreateEventPage.tsx";
import EventManagementPage from "../pages/EventManagementPage.tsx";
import RSVPResponsePage from "../pages/RSVPResponsePage.tsx";
import AdminDashboardPage from "../pages/AdminDashboardPage.tsx";
import {adminLoader} from "../loader/adminLoader.ts";

import AccountPage from "../pages/AccountPage.tsx";
import AllUsersDashboardPage from "../pages/AllUserDashboardPage.tsx";
import AllEventDashboardPage from "../pages/AllEventDashboardPage.tsx";
import {authenticationLoader} from "../loader/authenticationLoader.ts";
import MainLayout from "../components/MainLayout.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
    element: <MainLayout />,  //for authenticated routes
    loader: authenticationLoader,
    children: [
      {
        path: "/public-events",
        element: <PublicEventPage />
      },
      {
        path: "/event-detail/:id",
        element: <EventDetail />
      },
      {
      path: "/event-detail/:id/discussion",
      element: <DiscussionPage />
      },
      {
        path: "/create-event",
        element: <CreateEventPage />
      },
      {
        path: "/event-management",
        element: <EventManagementPage />
      },
      {
        path: "/rsvp-responses",
        element: <RSVPResponsePage />,
      },
      {
        path: "/account",
        element: <AccountPage />
      }
    ]
  },
    {
    element: <MainLayout />,  //for admin routes
    loader: adminLoader,
    children: [
      {
        path: "/admin-dashboard",
        element: <AdminDashboardPage />
      },
      {
        path: "/admin-dashboard/all-user-dashboard",
        element: <AllUsersDashboardPage />
      },
      {
        path: "/admin-dashboard/all-event-dashboard",
        element: <AllEventDashboardPage />
      }
    ]
  },
    {
        path: "*" ,
        element: <NotFound />
    },
]);