import {store} from "../redux/store.ts";
import {redirect} from "react-router-dom";
import {fetchCurrentUser} from "../redux/auth/authSlice.ts";

export async function authenticationLoader() {
	const state = store.getState();
	const isAuthenticated: boolean = state.auth.isAuthenticated;

	if (!isAuthenticated) {
		const result = await store.dispatch(fetchCurrentUser());
		if (fetchCurrentUser.fulfilled.match(result)) {
			return null
		} else {
			return redirect("/login");
		}
	}

	return null;
}