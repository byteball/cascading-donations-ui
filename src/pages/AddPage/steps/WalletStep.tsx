import { AddWalletModal } from "modals"

export const WalletStep: React.FC = () => (
  <div>
    <p>Please add your wallet to the site.</p>
    <div>
      <AddWalletModal triggerButtonIsPrimary={true} />
    </div>
  </div>
)