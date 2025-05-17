import {FormEvent, useState, useEffect} from "react";
import {fetchHandler} from "../../utils/fetchHandler.ts";
import {useAppDispatch, useAppSelector} from "../../hook/hooks.ts";
import {fetchGlobalSetting} from "../../redux/admin/globalSettingSlice.ts";
import {fetchOwnedEvents} from "../../redux/event/ownedEventsSlice.ts";
import { formatDateForInput } from '../../utils/dateUtils';

export default function CreateEventCard() {
    const [eventName, setEventName] = useState<string>('');
    const [eventLocation, setEventLocation] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [eventTime, setEventTime] = useState<Date>(new Date());
    const [eventType, setEventType] = useState<boolean>(true);
    const [image, setImage] = useState<File | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null); // null = hasn't submitted yet
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.globalSetting.settings);
    const userEvents = useAppSelector(state => state.ownedEvents.events);
    const eventLimit = settings?.eventLimit || 0;
    console.log(userEvents)

    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
    if (submitSuccess !== null) {
        setShowToast(true);
        const timer = setTimeout(() => {
        setShowToast(false);
        setSubmitSuccess(null);
        }, 1500);
        return () => clearTimeout(timer);
    }
    }, [submitSuccess]);


    useEffect(() => {
        dispatch(fetchGlobalSetting());
        dispatch(fetchOwnedEvents());
    }, [dispatch]);

    useEffect(() => {
        const availableEvents = userEvents?.filter(
            event => new Date(event.eventTime) > new Date()
        ) || [];

        setButtonDisabled(availableEvents.length >= eventLimit);
    }, [userEvents, eventLimit]);
    // Check if settings and user events are loaded

    const uploadImageToServer = async (file: File) => {
        const formData = new FormData()
        formData.append("image", file)
        console.log(formData)
        const res = await fetchHandler("/event/image", {
            method: "POST",
            body: formData,
        })
        console.log("Reached.")
        if (!res.ok) throw new Error("Image upload failed")
        const { imageId } = await res.json()
        return imageId
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!image) {
            alert("No image uploaded")
            return;
        }
        const imageId = await uploadImageToServer(image)
        try {
            const response = await fetchHandler("/event", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    eventName: eventName,
                    eventLocation: eventLocation,
                    eventDescription: eventDescription,
                    eventTime: eventTime,
                    isPublic: eventType,
                    images: imageId,
                })
            });
            if (!response.ok) {
                console.log(await response.json());
                setSubmitSuccess(false);
            } else {
                setSubmitSuccess(true);
                await dispatch(fetchOwnedEvents()); // Refresh events after successful creation
            }
        } catch (error) {
            console.log(error);
            setSubmitSuccess(false);
        }
    }

    return (
        <>
            {/* For animation*/}
            <style>{`
            .toast-animation {
                animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-in 1s;
            }

            @keyframes slideIn {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            `}</style>
            <h1 className="font-bold text-3xl flex justify-center">Create an event</h1>
            <div className="flex flex-row gap-10 mt-10 justify-around">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Event Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Name"
                        onChange={(e) => setEventName(e.target.value)}
                        required
                        className="w-108 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Event Location
                    </label>
                    <input
                        id="location"
                        type="text"
                        name="location"
                        placeholder="Location"
                        onChange={(e) => setEventLocation(e.target.value)}
                        required
                        className="w-108 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Event Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Description"
                        onChange={(e) => setEventDescription(e.target.value)}
                        required
                        className="w-108 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date and Time:
                    </label>
                    <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        required
                        value={formatDateForInput(eventTime)}
                        onChange={(e) => setEventTime(new Date(e.target.value))}
                        className="block w-108 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label id="type" className="block text-sm font-medium text-gray-700 mb-1">Event Type: </label>
                    <select
                        id="type"
                        name="eventType"
                        onChange={(e) => setEventType(e.target.value === "true")}
                        value={eventType.toString()}
                        className="block w-108 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                    </select>
                    <button
                        type="submit"
                        disabled= {buttonDisabled}
                        className={`w-42 text-white py-2 rounded-xl ${buttonDisabled ? 'bg-blue-200' : 'bg-blue-500 hover:bg-blue-600 transition duration-200 cursor-pointer'}`}>
                        {buttonDisabled ? 'Event Limit Reached' : 'Create Event'}
                    </button>
                </form>
                {/* Image Upload Section */}
                <div>
                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image
                    </label>
                    <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setImage(file);
                            }
                        }}
                        className="w-auto cursor-pointer bg-blue-500 rounded-xl hover:bg-blue-600 transition duration-200 py-1 px-2 text-white"
                    />
                    {image && (
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Preview"
                            className="mt-4 rounded-xl w-120 h-80"
                        />
                    )}
                </div>
            </div>
            {showToast && submitSuccess === true &&(
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 toast-animation">
                <div className="mt-4 p-4 rounded-lg bg-green-100 text-green-800 border border-green-300 shadow-lg">
                🎉 Event created successfully!
                </div>
            </div>
            )}

            {showToast && submitSuccess === false &&(
            <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 toast-animation">
                <div className="mt-4 p-4 rounded-lg bg-red-100 text-red-800 border border-red-300 shadow-lg">
                ❌ Something went wrong. Please try again.
                </div>
            </div>
            )}
        </>
    )
}