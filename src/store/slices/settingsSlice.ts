import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";

import { RootState } from "store";
import { getGithubUser } from "store/thunks/getGithubUser";

interface IFilters {
  tokens: Array<string>;
  areSetRules: boolean | "all";
  haveDonations: boolean | "all";
}


interface ICacheSlice {
  walletAddress: string | null;
  favorites: string[];
  githubUser?: string | null;
  filters: IFilters;
}

const initialState: ICacheSlice = {
  walletAddress: null,
  githubUser: null,
  favorites: [],
  filters: {
    haveDonations: "all",
    areSetRules: "all",
    tokens: []
  }
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    changeWallet: (state, action) => {
      state.walletAddress = action.payload;
    },
    addFavorite: (state, action) => {
      if (state.favorites.length < 6) {
        state.favorites.push(action.payload);
      } else {
        message.error("You can add up to 6 repositories to favorites")
      }
    },
    changeFilters: (state, action) => {
      const { type, value } = action.payload;

      if (state.filters === undefined) state.filters = initialState.filters;

      if (type === "haveDonations" && (typeof value === "boolean" || value === "all")) {
        state.filters.haveDonations = value;
      } else if (type === "areSetRules" && (typeof value === "boolean" || value === "all")) {
        state.filters.areSetRules = value;
      } else if (type === "tokens" && (typeof value === "object")) {
        state.filters.tokens = value;
      }
    },
    removeFilter: (state, action) => {
      const { type, value } = action.payload;
      if (type === "haveDonations") {
        state.filters.haveDonations = "all";
      } else if (type === "areSetRules") {
        state.filters.areSetRules = "all";
      } else if (type === "tokens" && value) {
        state.filters.tokens = state.filters.tokens.filter(t => t !== value);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter((fullName) => fullName !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getGithubUser.fulfilled, (state, action) => {
      state.githubUser = action.payload;
    })
  }
});

export const { changeWallet, addFavorite, removeFavorite, changeFilters, removeFilter } = settingsSlice.actions;

export const selectWalletAddress = (state: RootState) => state.settings.walletAddress;
export const selectGithubUser = (state: RootState) => state.settings.githubUser;
export const selectFavorites = (state: RootState) => state.settings.favorites;
export const selectFilters = (state: RootState) => state.settings.filters || initialState.filters;


export default settingsSlice.reducer;