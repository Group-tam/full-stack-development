import React from 'react';
import { MagnifyingGlassIcon, BellIcon, PlusIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { fetchHandler } from '../../utils/fetchHandler';
import {Notification} from "../../dataTypes/type.ts";
import MessageViewModal from '../Modals/MessageViewModal.tsx';
import {useFetch} from "../../utils/customHooks.ts";



interface NavbarProps {
  toggleSidebar: () => void;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<{text: string, eventName: string} | null>(null);
  const { data: latestNotifications } = useFetch<Notification[]>('/notification/user'); 

  useEffect(() => {
    if (latestNotifications) {
      setNotifications(latestNotifications);
    }
  }, [latestNotifications]);
  useEffect(() => {
    const handleUpdate = async () => {
      console.log('Received update event');
      try {
        const response = await fetchHandler(`/notification/user`);
        const newNotifications = await response.json();
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    window.addEventListener('notifications-update', handleUpdate);
    return () => {
      window.removeEventListener('notifications-update', handleUpdate);
    };
  }, []);

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const res = await fetchHandler(`/notification/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        // Refresh notifications after deletion
        const updated = notifications.filter(n => n._id !== notificationId);
        setNotifications(updated);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const renderNotificationText = (notification: Notification) => {
    const maxLength = 50;
    let displayText = '';

    if (notification.reminder) {
      displayText = `Reminder for this event`;
    } else {
      displayText = notification.text.startsWith('New message') ? 
        'New message from this event' :
        notification.text;
    }

    if (displayText.length > maxLength) {
      return `${displayText.substring(0, maxLength)}...`;
    }
    return displayText;
  };

  const handleDetailClick = (notification: Notification) => {
    //show only the message content without headers
    let modalText = notification.text;
    if (notification.reminder) {
      console.log(modalText)
    } else if (notification.text.startsWith('New message')) {
      modalText = notification.text.replace('New message from this event: ', '');
    }

    setSelectedMessage({
      text: modalText,
      eventName: notification.eventName || "Event Message"
    });
  };

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Only add listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]); // Depend on isOpen state

  return (
    <div className="relative" ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
            <BellIcon className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
              <h4 className="font-bold mb-2">Notifications</h4>
              {notifications.map(notification => (
                <div key={notification._id} className="p-2 border-b last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="text-sm flex-1 flex items-center">
                      <Link 
                        to={`/event-detail/${notification.eventId}`}
                        onClick={(e) => {
                          if (e.target !== e.currentTarget) {
                            e.stopPropagation();
                          }
                        }}
                        className="hover:text-blue-600"
                      >
                        <span className="line-clamp-2">{renderNotificationText(notification)}</span>
                      </Link>
                      {(notification.reminder || notification.text.startsWith('New message')) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDetailClick(notification);
                          }}
                          className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                        >
                          Detail
                        </button>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification._id);
                      }}
                      className="transition-opacity text-lg text-gray-700 hover:text-blue-600 ml-2"
                    >
                      OK
                    </button>
                  </div>
                  <time className="text-xs text-gray-500">
                    {new Date(notification.sendTime).toLocaleString()}
                  </time>
                </div>
              ))}
              {notifications.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No notifications
            </p>
          )}
            </div>
          )}
          <MessageViewModal
        show={!!selectedMessage}
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </div>
  );
};


// adding a trigger to navigate to the create event page


const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {

  const navigate = useNavigate();

  //  navigate to createEventPage
  const handleClick = () => {
      navigate('/create-event'); 
    };

  return (
    // navbar components. 
    <nav className="bg-[#f4d03f] h-16 flex items-center justify-between px-6 fixed w-full top-0 z-50">
      {/* Hamburger button*/}
      <button 
        onClick={toggleSidebar}
        className="text-gray-800 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-[#f7dc6f]"
      >
        {/* Hamburger bar icon */}
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/*  */}
      <div className="flex-1 max-w-2xl mx-auto flex items-center">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg mx-auto">
          {/* Search Bar input */}
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 rounded-full bg-[#f7dc6f] border-none focus:outline-none focus:ring-2 focus:ring-[#f1c40f] text-gray-800 placeholder-gray-600"
          />
          {/* // Search Input */}
          <MagnifyingGlassIcon className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600" />
        </div>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center space-x-4">
        {/* // Create button */}
        <button name="createEventButton" className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-colors cursor-pointer" onClick={handleClick}>
          <PlusIcon className="h-5 w-5" />
          <span>Create</span>
        </button>
        <NotificationsDropdown />
      </div>
    </nav>
  );
};

export default Navbar;