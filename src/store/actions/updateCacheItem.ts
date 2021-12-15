import { createAction } from "@reduxjs/toolkit";

import { cacheType } from "store/slices/cacheSlice";

export interface IUpdateActionPayload {
  type: cacheType,
  identificator: string,
  data: any
}

export const updateCacheItem = createAction<IUpdateActionPayload>('update_cache_item');