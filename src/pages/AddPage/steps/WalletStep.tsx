import { AddWalletModal } from "modals"

export const WalletStep: React.FC = () => (
  <div>
    <p>Your repo can receive donations already now, without any setup. However, to set up your own distribution rules and withdraw the donated money, you need to prove ownership of the repo and link it to your wallet.</p>
    <p>As the first step, please add your wallet to the site.</p>
    <div>
      <AddWalletModal triggerButtonIsPrimary={true} />
    </div>
  </div>
)