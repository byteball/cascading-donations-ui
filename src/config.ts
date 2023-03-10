export default {
  testnet: process.env.REACT_APP_TESTNET === "1",
  aa_address: process.env.REACT_APP_AA_ADDRESS!,
  attestor: process.env.REACT_APP_ATTESTOR!,
  attestor_aa: process.env.REACT_APP_ATTESTOR_AA!,
  icon_cdn_url: process.env.REACT_APP_ICON_CDN_URL,
  backend_url: process.env.REACT_APP_BACKEND_URL,
  client_url: process.env.REACT_APP_CLIENT_URL,
  pairing_url: process.env.REACT_APP_PAIRING_URL,
  hub_api_url: process.env.REACT_APP_HUB_API_URL,
  GA_id: process.env.REACT_APP_GA_ID
}