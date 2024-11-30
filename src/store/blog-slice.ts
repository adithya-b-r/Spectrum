import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DarkMode {
  blogTheme: "light" | "dark";
}

interface ThemeState {
  theme: DarkMode;
}

const initialState: ThemeState = {
  theme: { blogTheme: "light" },
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    toggleTheme: (state, action: PayloadAction<DarkMode>) => {
      state.theme.blogTheme = action.payload.blogTheme;
    },
  },
});

export const { toggleTheme } = blogSlice.actions;
export default blogSlice.reducer;
