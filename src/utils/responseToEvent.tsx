import moment from "moment";
import { Link } from "react-router-dom";

import config from "config";
import { IResponse } from "store/thunks/getAaResponses";
import { IToken } from 'api/backend';
import { IRules } from "api/agent";

interface IObyteTokens {
  [key: string]: IToken
}

export interface IEvent {
  message: any;
  repository: string;
  author: any;
  time: string;
  link: string;
}

export const responseToEvent = (responses: IResponse[], tokens: IObyteTokens | undefined) => {
  return (responses && tokens) ? [...responses].sort((a, b) => b.timestamp - a.timestamp).map(({ response, trigger_address, trigger_unit, timestamp }) => {
    const responseVars = response?.responseVars;
    let type: string | undefined = undefined;
    let message: any;
    let repository: string | undefined = undefined;
    const time = moment.unix(timestamp).format("LLL");
    const link = `https://${config.testnet ? "testnet" : ""}explorer.obyte.org/#${trigger_unit}`;

    if (responseVars && responseVars?.message) {
      if (responseVars.message.includes("Rules for ")) {
        type = "set_rules"
        repository = responseVars.message.split(" ")?.[2];
        const newRules = responseVars.new_rules && JSON.parse(responseVars.new_rules) as IRules;
        message = <span>Rules for <Link to={`/repo/${repository}`}>{repository}</Link> have been changed to {(newRules && Object.keys(newRules).length > 0) ? Object.entries(newRules).map(([fullName, percent]) => `${fullName} ${percent}%`).join("; ") : `${repository} 100%`};</span>
      } else if (responseVars.message.includes("Successful donation to ")) {
        type = "donate"
        repository = responseVars.message.split(" ")?.[3];
        const donatedVarName = Object.keys(responseVars).find(v => v.includes("donated_in_"));

        if (donatedVarName) {
          const asset = donatedVarName.split("_")?.[2];
          const amount = responseVars[donatedVarName];
          const donor = responseVars?.donor || trigger_address;
          message = <span><a target="_blank" rel="noopener" href={`https://${config.testnet ? "testnet" : ""}explorer.obyte.org/#${donor}`}>{donor.slice(0, 10)}...</a> has donated {amount / (10 ** ((asset in tokens) ? (tokens[asset].decimals || 0) : 0))} {asset in tokens ? tokens[asset].symbol : asset.slice(0, 5)} to <Link to={`/repo/${repository}`}>{repository}</Link></span>
        } else {
          return null;
        }

      } else if (responseVars.message.includes("Distribution for ")) {
        type = "distribution"
        repository = responseVars.message.split(" ")?.[3];
        const asset = responseVars.message.split(" ")?.[6];
        message = `Distribution of ${asset in tokens ? tokens[asset].symbol : asset.slice(0, 5)} for ${repository}`;
      }
    }

    if (type && repository && message) {
      return {
        repository,
        author: responseVars?.donor || trigger_address,
        message,
        link,
        time
      }
    } else {
      return null
    }

  }).filter(e => e !== null) : [];
}