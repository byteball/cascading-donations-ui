import axios from "axios";
import config from 'config';
import { ISearchResultItem } from "./github";

interface IPopularRepos {
  data: IPopularRepo[];
}

interface IPopularRepo {
  total_received_in_base: number;
  full_name: string;
  info: {
    description: string | null;
    language: string | null;
    stargazers_count?: number;
    forks_count?: number;
    created_at?: string;
  }
}

interface ISearchResult {
  data: ISearchResultItem[],
  limit: number
}

export interface IToken {
  symbol: string;
  decimals: number;
  network?: string;
  asset?: string;
  obyte_asset?: string;
  price?: number | null;
}

export interface ITokens {
  data: {
    Obyte?: {
      [key: string]: IToken
    },
    Ethereum?: {
      [key: string]: IToken
    },
    BSC?: {
      [key: string]: IToken
    },
    Polygon?: {
      [key: string]: IToken
    },
  }
}


export class backendAPI {
  static getPopular = async () => {
    const data = await axios.get<IPopularRepos>(`${config.backend_url}/popular`).then(({ data }) => data?.data);
    return data.map(({ full_name, info }) => ({ full_name, stargazers_count: info.stargazers_count || 0, forks_count: info.forks_count || 0, ...info }))
  }

  static getTokens = async () => {
    return await axios.get<ITokens>(`${config.backend_url}/tokens`).then(({ data }) => data?.data);
  }

  static search = async (query: string) => {
    return await axios.get<ISearchResult>(`${config.backend_url}/search?q=${encodeURIComponent(query)}`).then(({ data }) => data?.data);
  }
}