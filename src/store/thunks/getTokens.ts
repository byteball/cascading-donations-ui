import { createAsyncThunk } from "@reduxjs/toolkit";

import { backendAPI } from 'api/backend';

export const getTokensThunk = createAsyncThunk(
  'get/tokens',
  async () => {
    try {
      return await backendAPI.getTokens();
    } catch {
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
)