import { createSlice, createSelector } from "@reduxjs/toolkit";

import { RootState } from "store";
import { getAaResponses, IResponse } from "store/thunks/getAaResponses";
import { responseToEvent } from "utils";

interface IResponsesSlice{
  status: 'loading' | 'loaded',
  data: IResponse[]
}

const initialState: IResponsesSlice = {
  status: "loading",
  data: []
};

export const responsesSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {
    addResponse: (state, action) => {
      state.data.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getAaResponses.pending, (state) => {
      state.status = 'loading'
    });

    builder.addCase(getAaResponses.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'loaded'
    })
  }
});

export const { addResponse } = responsesSlice.actions;

export const selectResponses = (state: RootState) => state.responses.data;
export const selectEvents = createSelector((state: RootState) => state.responses.data, (state: RootState) => state.tokens.data.Obyte, responseToEvent);

export default responsesSlice.reducer;