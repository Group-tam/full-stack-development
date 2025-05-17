import {configureStore} from "@reduxjs/toolkit";
import authReducer from './auth/authSlice.ts'
import sidebarReducer from "./components/sidebarSlice.ts";
import publicEventReducer from "./event/publicEventSlice.ts";
import singleEventReducer from "./event/singleEventSlice.ts";
import ownedEventsReducer from "./event/ownedEventsSlice.ts";
import joinedEventReducer from "./event/joinedEventSlice.ts";
import isAdminReducer from "./auth/isAdminSlice.ts";
import globalSettingReducer from "./admin/globalSettingSlice.ts"
import messageReducer from './message/messageSlice';
import rsvpReducer from './rsvp/rsvpSlice';
import eventsReducer from "./event/eventsSlice.ts";
import usersReducer from "./user/usersSlice.ts"
import searchReducer from "./search/searchSlice.ts";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        sidebar: sidebarReducer,
        publicEvent: publicEventReducer,
        singleEvent: singleEventReducer,
        ownedEvents: ownedEventsReducer,
        joinedEvents: joinedEventReducer,
        events: eventsReducer,
        users: usersReducer,
        isAdmin: isAdminReducer,
        globalSetting: globalSettingReducer,
        messages: messageReducer,
        rsvp: rsvpReducer,
        search: searchReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;