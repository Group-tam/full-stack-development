import {store} from "../redux/store.ts";
import {fetchIsAdmin} from "../redux/auth/isAdminSlice.ts";
import {redirect} from "react-router-dom";

export async function adminLoader() {
    const state = store.getState();
    let isAdmin = state.isAdmin.isAdmin;

    if (isAdmin === null) {
        const result = await store.dispatch(fetchIsAdmin());
        if (fetchIsAdmin.fulfilled.match(result)) {
            isAdmin = result.payload;
        }
    }

    if (!isAdmin) {
        return redirect("/login");
    }

    return null;
}