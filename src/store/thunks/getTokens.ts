import { createAsyncThunk } from "@reduxjs/toolkit";
import { backendAPI } from 'api/backend';
import { isEmpty } from 'lodash';

import { store } from "store";

export const getTokensThunk = createAsyncThunk(
  'get/tokens',
  async () => {
    try {
      return await backendAPI.getTokens();
    } catch {
      const state = store.getState();
      if (isEmpty(state?.tokens?.data?.Obyte)){
        return ({
          Obyte: {
            base: {
              asset: "base",
              symbol: "GBYTE",
              decimals: 9
            }
          }
        })
      }
    }
  }
)