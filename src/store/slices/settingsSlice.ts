import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";
import { isArray } from 'lodash';

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
  githubUsers: string[];
  activeGithubUser: string | null;
  filters: IFilters;
}

const initialState: ICacheSlice = {
  walletAddress: null,
  githubUsers: [],
  activeGithubUser: null,
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
    },
    changeActiveGithubUser: (state, action) => {
      const user = action.payload;
      if (state.githubUsers && state.githubUsers.includes(user)) {
        state.activeGithubUser = user;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getGithubUser.fulfilled, (state, action) => {
      if (isArray(action.payload) && action.payload.length > 0) {
        const users = action.payload;
        state.githubUsers = users;

        if (state.activeGithubUser && users.includes(state.activeGithubUser)) {
          // don't change
        } else {
          state.activeGithubUser = users[0];
        }
      }
    })
  }
});

export const { changeWallet, addFavorite, removeFavorite, changeFilters, removeFilter, changeActiveGithubUser } = settingsSlice.actions;

export const selectWalletAddress = (state: RootState) => state.settings.walletAddress;
export const selectGithubUsers = (state: RootState) => state.settings.githubUsers;
export const selectActiveGithubUser = (state: RootState) => state.settings.activeGithubUser;
export const selectFavorites = (state: RootState) => state.settings.favorites;
export const selectFilters = (state: RootState) => state.settings.filters || initialState.filters;


export default settingsSlice.reducer;