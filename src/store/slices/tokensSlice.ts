import { createSlice } from "@reduxjs/toolkit";

import { ITokens } from "api/backend";
import { RootState } from "store";
import { getTokensThunk } from '../thunks/getTokens';

interface ITokensSlice extends ITokens {
  status: 'loading' | 'loaded'
}

const initialState: ITokensSlice = {
  status: "loading",
  data: {}
};

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTokensThunk.pending, (state) => {
      state.status = 'loading'
    });

    builder.addCase(getTokensThunk.fulfilled, (state, action) => {
      const data = action.payload;
      if (data) {
        state.data = data;
        state.status = 'loaded'
      }
    })
  }
});

export const selectTokensData = (state: RootState) => state.tokens.data;
export const selectObyteTokens = (state: RootState) => state.tokens.data.Obyte;

export const selectTokensStatus = (state: RootState) => state.tokens.status;

export default tokensSlice.reducer;