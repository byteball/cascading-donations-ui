import { isEmpty } from 'lodash';

import config from 'config';
import { Attestation } from 'obyte';
import { client } from 'obyteInstance';
import github from 'api/github';

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

export class Agent {
  static getRules = async (fullName: string): Promise<getRulesResult> => {
    let exists = true;
    const var_prefix = `${fullName}*rules`;

    let rules = await client.api.getAaStateVars({
      address: config.aa_address,
      var_prefix
    }) as IStateVars;

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
        if (a.attestor_address === config.aa_attestor && a?.profile && a.profile.github_username) {
          if (!githubNames.includes(a.profile.github_username)) {
            githubNames.push(a.profile.github_username);
          }
        }
      });

      const getters = githubNames.map((user) => client.api.getAaStateVars({
        address: config.aa_attestor_forward,
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