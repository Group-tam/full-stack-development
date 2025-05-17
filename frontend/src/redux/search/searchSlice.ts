import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
    eventName: string;
    filterType?: 'all' | 'joined' | 'owned';
}

const initialState: SearchState = {
    eventName: '',
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        updateSearch: (state, action: PayloadAction<Partial<SearchState>>) => {
            return { ...state, ...action.payload };
        },
        clearSearch: () => initialState,
    },
});

export const { updateSearch, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
