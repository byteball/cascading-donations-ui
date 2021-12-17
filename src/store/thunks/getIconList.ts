import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import config from "config";
import { store } from "store";

export const getIconList = createAsyncThunk(
  'get/iconList',
  async () => {
    const state = store.getState();

    const timestamp = Date.now() / 1000;

    if (state.cache.icons.status !== "loaded" || (state.cache.icons.status === "loaded" && state.cache.icons.update_at + 60 * 60 * 12 < timestamp)) {
      const { data } = await axios.get<string[]>(`${config.icon_cdn_url}/list.json`);
      try {
        return data
      } catch {
        return null;
      }
    } else {
      return null
    }
  }
)