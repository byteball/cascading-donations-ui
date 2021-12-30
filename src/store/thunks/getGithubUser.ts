import { createAsyncThunk } from "@reduxjs/toolkit";

import { Agent } from "api/agent";
import { store } from "store";

export const getGithubUser = createAsyncThunk(
  'get/githubUser',
  async () => {
    const state = store.getState();
    const walletAddress = state.settings.walletAddress;
    if (walletAddress) {
      return await Agent.getGithubUsersByObyteAddress(walletAddress);
    }
  }
)