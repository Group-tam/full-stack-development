import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

export const login = createAsyncThunk(
    "auth/login",
    async ({username, password}: {username: string; password: string}) => {
            const response = await fetch("/log/in", {
                method: "POST",
                headers: {
                    m_sUsername: username,
                    m_sPassword: password,
                },
                credentials: "include",
            })
            if (response.status !== 200) {
                throw new Error(response.statusText);
            }

            return true
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        error: null
    },
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state) => {
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(login.rejected, (state) => {
                state.error = null
            })
    },
})

export const {logout} = authSlice.actions
export default authSlice.reducer

