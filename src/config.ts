export default {
  testnet: process.env.REACT_APP_TESTNET === "1",
  aa_address: process.env.REACT_APP_AA_ADDRESS!,
  aa_attestor: process.env.REACT_APP_AA_ATTESTOR!,
  icon_cdn_url: process.env.REACT_APP_ICON_CDN_URL,
  backend_url: process.env.REACT_APP_BACKEND_URL,
  client_url: process.env.REACT_APP_CLIENT_URL
}