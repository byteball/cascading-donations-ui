import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "store";

import { getIconList } from "store/thunks/getIconList";
import { updateCacheItem, IUpdateActionPayload } from '../actions/updateCacheItem';
import { ISearchResultItem } from 'api/github';
import { clearAllCache } from 'store/actions/clearAllCache';

type status = 'loaded' | "pending";

interface ICacheItem<T> {
  data: T,
  status: status,
  update_at: number,
}

interface ICacheItemList<T> {
  data: {
    [key: string]: ICacheItem<T>
  },
  retention_period: number; // in seconds
}

export interface IRepoInfo {
  full_name: string,
  description: string | null,
  language: string | null,
  stargazers_count: number,
  forks_count: number,
  created_at?: string,
}

export interface IContributor {
  login?: string;
  contributions: number;
}

export interface ICacheSlice {
  icons: ICacheItem<Array<string>>,
  basicInfo: ICacheItemList<IRepoInfo>,
  contributors: ICacheItemList<IContributor[]>,
  reposList: ICacheItemList<ISearchResultItem[]>
  bannerExists: ICacheItemList<boolean>
}

export type cacheType = "basicInfo" | "contributors" | "reposList" | "bannerExists";


const initialState: ICacheSlice = {
  icons: {
    data: [],
    status: "pending",
    update_at: 0
  },
  basicInfo: {
    data: {},
    retention_period: 60 * 60 * 24 * 2 // 2 days
  },
  contributors: {
    data: {},
    retention_period: 60 * 60 * 24 * 2 // 2 days
  },
  reposList: {
    data: {},
    retention_period: 60 * 60 // 1 hour
  },
  bannerExists: {
    data: {},
    retention_period: 60 * 60 * 24 // 1 day
  }
};

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(getIconList.fulfilled, (state, action) => {
      if (action.payload) {
        state.icons.status = 'loaded';
        state.icons.data = action.payload;
        state.icons.update_at = Math.trunc(Date.now() / 1000);
      }
    });

    builder.addCase(updateCacheItem.type, (state, action: PayloadAction<IUpdateActionPayload>) => {
      const { data, type, identifier } = action.payload;
      if (type in state) {
        state[type].data[identifier] = {
          data,
          status: "loaded",
          update_at: Math.ceil(Date.now() / 1000)
        }
      }
    });

    builder.addCase(clearAllCache.type, (state) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const contributorsCache = state.contributors.data;
      const bannerExistsCache = state.bannerExists.data;
      const reposListCache = state.reposList.data;
      const basicInfoCache = state.basicInfo.data;

      // clear contributors cache
      Object.keys(contributorsCache).forEach((identifier) => {
        if ((contributorsCache[identifier].update_at + state.contributors.retention_period) < timestamp) {
          delete state.contributors.data[identifier];
        }
      });

      // clear bannerExists cache
      Object.keys(bannerExistsCache).forEach((identifier) => {
        if ((bannerExistsCache[identifier].update_at + state.bannerExists.retention_period) < timestamp) {
          delete state.bannerExists.data[identifier];
        }
      });

      // clear reposList cache
      Object.keys(reposListCache).forEach((identifier) => {
        if ((reposListCache[identifier].update_at + state.reposList.retention_period) < timestamp) {
          delete state.reposList.data[identifier];
        }
      });

      // clear reposList cache
      Object.keys(basicInfoCache).forEach((identifier) => {
        if ((basicInfoCache[identifier].update_at + state.basicInfo.retention_period) < timestamp) {
          delete state.basicInfo.data[identifier];
        }
      });
    })
  }
});


export const selectIconList = (state: RootState) => state.cache.icons.data;

export default cacheSlice.reducer;