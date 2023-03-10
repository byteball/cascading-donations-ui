import { isEmpty } from 'lodash';

import config from 'config';
import { Attestation } from 'obyte';
import { client } from 'obyteInstance';
import github from 'api/github';
import { ITokenByNetwork } from './backend';

export interface IStateVars {
  [key: string]: any;
}

export interface IRules {
  [key: string]: number;
}

export interface IPool {
  asset: string;
  amount: number;
}

interface IPoolsByRepo {
  [key: string]: Array<IPool>;
}

type getRulesResult = [IRules, boolean];

interface ITokenAmount {
  amount: number;
  symbol: string;
}

type tokenAmounts = Array<ITokenAmount>;

export class Agent {
  static getRules = async (fullName: string, isHttpRequest?: boolean): Promise<getRulesResult> => {
    let exists = true;
    let rules = {} as IStateVars;
    const var_prefix = `${fullName}*rules`;

    if (!isHttpRequest) {
      rules = await client.api.getAaStateVars({
        address: config.aa_address,
        var_prefix
      }) as IStateVars;
    } else {
      rules = await fetch(`${config.hub_api_url}/get_aa_state_vars`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ address: config.aa_address, var_prefix })
      }).then(async (response) => {
        const res = await response.json();
        if (res.error) throw Error(res.error);
        return res.data;
      }).catch(async _ => await client.api.getAaStateVars({
        address: config.aa_address,
        var_prefix
      }));
    }

    if (isEmpty(rules)) {
      rules = {};
      exists = false;
    }

    rules = rules?.[var_prefix] as IRules;

    let p = 0;

    rules && Object.keys(rules).forEach(key => {
      p += Number(rules[key])
    })


    if (p < 100) {
      rules = {
        ...rules,
        [fullName]: 100 - p
      }
    }

    return [rules, exists]
  }

  static getGithubUsersByObyteAddress = async (address: string) => {
    try {
      const attestations = await getAttestations(address);
      const githubNames: string[] = [];

      attestations.forEach((a: any) => {
        if (a.attestor_address === config.attestor && a?.profile && a.profile.github_username) {
          if (!githubNames.includes(a.profile.github_username)) {
            githubNames.push(a.profile.github_username);
          }
        }
      });

      const getters = githubNames.map((user) => client.api.getAaStateVars({
        address: config.attestor_aa,
        var_prefix: `u2a_${user}`
      }).then((data: any) => ({ user, adr: data?.[`u2a_${user}`] })) as IStateVars);

      const users = await Promise.all(getters);

      return users.filter(({ adr }) => (address === adr) && typeof adr === 'string').map((item) => item.user) as string[];

    } catch {
      return null
    }
  }

  static getPoolsByFullName = async (fullName: string) => {
    const stateVars = await client.api.getAaStateVars({
      address: config.aa_address,
      var_prefix: `${fullName}*pool*`
    }) as IStateVars;

    const pools: IPool[] = [];
    for (const row in stateVars) {
      const rowSplit = row.split("*");
      if (rowSplit[1] === "pool") {
        pools.push({ asset: rowSplit[2], amount: stateVars[row] });
      }
    }

    return pools
  }

  static getTotalReceivedByFullName = async (fullName: string, tokens: ITokenByNetwork) => {
    let receivedTokens: tokenAmounts = [];
    let totalReceivedInUSD = 0;

    let undistributedTokens: tokenAmounts = [];
    let totalUndistributedInUSD = 0;

    const totalReceivedStateVars = await client.api.getAaStateVars({
      address: config.aa_address,
      var_prefix: `${fullName}*total_received*` // var[${repo}*total_received*${asset}] - total received by repo in asset
    }) as IStateVars;

    const totalUndistributedStateVars = await client.api.getAaStateVars({
      address: config.aa_address,
      var_prefix: `${fullName}*pool*` // var[${repo}*pool*${asset}] - repo's undistributed pool in asset
    }) as IStateVars;

    Object.entries(totalReceivedStateVars).forEach(([varName, amount]) => {
      const asset = varName.split("*")?.[2];

      const assetInfo = tokens[asset];

      if (assetInfo && assetInfo.price) {
        const amountInUSD = (amount / 10 ** assetInfo.decimals) * assetInfo.price;

        totalReceivedInUSD += amountInUSD;

        receivedTokens.push({ amount: amount / 10 ** assetInfo.decimals, symbol: assetInfo.symbol })
      }
    });

    Object.entries(totalUndistributedStateVars).forEach(([varName, amount]) => {
      const asset = varName.split("*")?.[2];

      const assetInfo = tokens[asset];

      if (assetInfo && assetInfo.price && Number(amount)) {
        const amountInUSD = (amount / 10 ** assetInfo.decimals) * assetInfo.price;

        totalUndistributedInUSD += amountInUSD;
        undistributedTokens.push({ amount: amount / 10 ** assetInfo.decimals, symbol: assetInfo.symbol })
      }
    });

    return { received: totalReceivedInUSD, undistributed: totalUndistributedInUSD, receivedTokens, undistributedTokens }
  }

  static getManagementList = async (owner: string, query?: string) => {
    const stateVars = await client.api.getAaStateVars({
      address: config.aa_address,
      var_prefix: owner
    }) as IStateVars;

    const poolsByRepo: IPoolsByRepo = {};

    Object.entries(stateVars).forEach(([varName, value]) => {
      if (varName.includes("*pool*")) {
        // eslint-disable-next-line
        const [repo, __, asset] = varName.split("*");
        if (poolsByRepo[repo]) {
          poolsByRepo[repo].push({
            asset,
            amount: value
          });
        } else {
          poolsByRepo[repo] = [{
            asset,
            amount: value
          }]
        }
      }
    })

    const listByGithubName = await github.getReposListByUser(owner, query).then((repos) => repos.map((repo) => {
      return ({ ...repo, rulesAreSet: `${repo.title}*rules` in stateVars, pools: poolsByRepo[repo.title] })
    }));

    return listByGithubName;
  }

  static getNotificationAAByRepo = async (fullName: string) => {
    const var_prefix = `${fullName}*notification_aa`;

    const stateVars = await client.api.getAaStateVars({
      address: config.aa_address,
      var_prefix
    }) as IStateVars;

    if (var_prefix in stateVars) {
      return stateVars[var_prefix];
    } else {
      return null
    }
  }
}

export const getAttestations = (walletAddress: string) => {
  return new Promise<Attestation[]>(function (resolve, reject) {
    client.api.getAttestations({ address: walletAddress }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res as Attestation[]);
      }
    });
  })
}