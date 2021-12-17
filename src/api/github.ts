import { store } from "store"
import { Octokit } from "@octokit/rest";
import { isEmpty } from "lodash";

import { backendAPI } from 'api/backend';
import { updateCacheItem } from "store/actions/updateCacheItem";
import { generateBannerCode } from 'utils/generateBannerCode';

export interface ISearchResultItem {
  title: string;
  description: string | null;
}

class Github {
  private github: Octokit;
  private limitErrorTime: number | null;

  constructor() {
    this.github = new Octokit();
    this.limitErrorTime = null;
  }

  getBasicInformation = async (fullName: string) => {
    const state = store.getState();
    const allCache = state.cache.basicInfo.data;
    const item = allCache[fullName];

    if (!item || (item && ((item.update_at + ((item.data.created_at) ? 60 * 60 * 24 * 2 : 60 * 60)) < (Date.now() / 1000)))) {
      const [owner, repo] = fullName.split("/");
      try {
        const { data } = await this.github.rest.repos.get({
          owner,
          repo
        })

        const newData = {
          full_name: fullName,
          description: data.description,
          language: data.language,
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          created_at: data.created_at,
        }

        store.dispatch(updateCacheItem({
          data: newData,
          identifier: fullName,
          type: "basicInfo"
        }))

        return newData;
      } catch {
        const newData = {
          full_name: fullName,
          description: null,
          language: null,
          stargazers_count: 0,
          forks_count: 0
        }

        store.dispatch(updateCacheItem({
          data: newData,
          identifier: fullName,
          type: "basicInfo"
        }))

        return newData;
      }
    } else {
      console.log("cache")
      return item.data;
    }
  }

  getContributors = async (fullName: string) => {
    const state = store.getState();
    const allCache = state.cache.contributors.data;
    const item = allCache[fullName];
    const [owner, repo] = fullName.split("/");

    if (!item || (item && ((item.update_at + (item.data && item.data.length > 0 ? 60 * 60 * 24 * 2 : 60 * 60 * 2)) < (Date.now() / 1000)))) {
      try {
        const { data } = await this.github.rest.repos.listContributors({
          owner,
          repo,
          per_page: 10
        });

        const newData = data.map(({ login, contributions }) => ({ login, contributions }))

        store.dispatch(updateCacheItem({
          data: newData,
          identifier: fullName,
          type: "contributors"
        }))
        return newData;
      } catch {
        store.dispatch(updateCacheItem({
          data: [],
          identifier: fullName,
          type: "contributors"
        }))
        return []
      }

    } else {
      return item.data || [];
    }
  }

  getReposListByUser = async (owner: string) => {
    const state = store.getState();
    const allCache = state.cache.reposList.data;
    const item = allCache[owner];

    if ((!item || (item && ((item.update_at + 60 * 60 * 1) < (Date.now() / 1000))))) {
      let repos: ISearchResultItem[] = [];
      let page = 1;
      console.log("no cache")
      try {
        while (owner) {
          const list = await this.github.rest.repos.listForUser({
            username: owner,
            per_page: 100,
            page: page
          }).then(data => data?.data);

          if (isEmpty(list) && list.length < 100) {
            break;
          } else {
            const newData = list.map((i) => ({
              title: String(i.full_name).toLowerCase(),
              description: i.description
            }))
            repos = [...repos, ...newData];
            page++;
          }
        }
        store.dispatch(updateCacheItem({
          data: repos,
          identifier: owner,
          type: "reposList"
        }))

        return repos;
      } catch (e: any) {
        if (e && e.message && e.message === "Not Found") {
          store.dispatch(updateCacheItem({
            data: repos,
            identifier: owner,
            type: "reposList"
          }))
        }
        return repos;
      }
    } else {
      console.log("cache")
      return item.data
    }
  }


  searchRepos = async (query: string): Promise<ISearchResultItem[]> => {
    const [owner, name] = query.split("/");
    let q = query;
    let result: ISearchResultItem[] = [];

    if (this.limitErrorTime && ((this.limitErrorTime + 60) > (Date.now() / 1000))) {
      result = await backendAPI.search(query);
    } else {
      try {
        if (owner && name) {
          q = `user:${owner} ${name}`
        }

        result = await this.github.request('GET /search/repositories', {
          q,
        }).then((result) => result.data.items.map((item) => ({ title: item.full_name, description: item.description })));
        
        this.limitErrorTime = null;
      } catch {
        this.limitErrorTime = Date.now() / 1000;
        result = await backendAPI.search(query);
      }
    }

    return result;
  }

  checkBanner = async (fullName: string): Promise<boolean> => {
    const state = store.getState();
    const allCache = state.cache.bannerExists.data;
    const item = allCache[fullName];
    const [owner, repo] = fullName.split("/");
    const bannerCode = generateBannerCode(fullName);

    if ((!item || (item && ((item.update_at + (item && item.data ? 60 * 60 * 24 : 60 * 60 * 1)) < (Date.now() / 1000))))) {
      try {
        const { data: content } = await this.github.rest.repos.getReadme({
          owner,
          repo
        });

        if (content.content) {
          const readme = window.atob(content.content);
          const exists = readme?.includes(bannerCode) || false;

          store.dispatch(updateCacheItem({
            data: exists,
            identifier: fullName,
            type: "bannerExists"
          }))

          return exists;
        } else {
          store.dispatch(updateCacheItem({
            data: false,
            identifier: fullName,
            type: "bannerExists"
          }))
          return false;
        }


      } catch {
        store.dispatch(updateCacheItem({
          data: false,
          identifier: fullName,
          type: "bannerExists"
        }))
        return false;
      }
    } else {
      return !!item.data
    }
  }
}

export default new Github();