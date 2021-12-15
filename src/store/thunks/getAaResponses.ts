import { createAsyncThunk } from "@reduxjs/toolkit";

import { client } from 'obyteInstance';
import config from "config";

export interface IResponse {
  mci: number;
  trigger_address: string;
  aa_address: string;
  trigger_unit: string;
  bounced: 0 | 1;
  response_unit: string | null;
  timestamp: number;
  response?: {
    responseVars?: {
      [key: string]: any
    }
  }
}

export const getAaResponses = createAsyncThunk(
  'get/aaResponses',
  async () => {
    return await client.api.getAaResponses({ aa: config.aa_address }) as IResponse[];
  }
)