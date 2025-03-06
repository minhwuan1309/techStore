import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asyncActions';

const initialState = {
    categories: [],
    brands: [],
    isLoading: false,
    isShowModal: false,
    modalChildren: null,
    isShowCart: false,
    error: null
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        showModal: (state, action) => {
            state.isShowModal = action.payload.isShowModal;
            state.modalChildren = action.payload.modalChildren;
        },
        showCart: (state) => {
            state.isShowCart = !state.isShowCart;
        }
    },
    extraReducers: (builder) => {
        // Xử lý cho Categories
        builder.addCase(actions.getCategories.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(actions.getCategories.fulfilled, (state, action) => {
            state.isLoading = false;
            state.categories = action.payload;
        });
        builder.addCase(actions.getCategories.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload?.message;
        });
    }
});

export const { showModal, showCart } = appSlice.actions;
export default appSlice.reducer;
