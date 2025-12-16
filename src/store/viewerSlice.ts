import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ViewerState {
  imageUrl: string | null;
}

const initialState: ViewerState = {
  imageUrl: null,
};

const viewerSlice = createSlice({
  name: "viewer",
  initialState,
  reducers: {
    setViewerImageUrl(state, action: PayloadAction<string | null>) {
      state.imageUrl = action.payload;
    },
  },
});

export const { setViewerImageUrl } = viewerSlice.actions;

export default viewerSlice.reducer;

