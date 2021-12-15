import config from "config";
import { encodeData } from "./encodeData";

const suffix = config.testnet ? "-tn" : "";

interface IParamsGenerateLink {
  amount: number;
  data?: object;
  from_address?: string | null;
  aa: string;
  asset?: string;
  is_single?: boolean;
}

export const generateLink = (params: IParamsGenerateLink) => {
  const { amount, data, from_address, aa, asset, is_single } = params;

  let link = `obyte${suffix}:${aa}?amount=${Math.round(amount)}&asset=${encodeURIComponent(asset || "base")}`;

  if (data)
    link += '&base64data=' + encodeURIComponent(encodeData(data));
  if (from_address)
    link += '&from_address=' + from_address;
  if (is_single)
    link += '&single_address=1';
  return link;
};
