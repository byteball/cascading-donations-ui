import config from "config";

export const generateBannerCode = (fullName: string) => {
  return `[![Kivach](${config.backend_url}/banner?repo=${fullName})](${config.client_url}/repo/${fullName})`;
}