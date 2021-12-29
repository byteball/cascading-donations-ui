import { Image } from "antd";

import config from "config"

export const AttestationStep: React.FC = () => (<div>
  <p>To link your wallet with your github account, you need to get an attestation.</p>

  <p>Please <a href={config.pairing_url}>pair with the GitHub attestation bot</a> in your Obyte wallet and follow its instructions. The bot will ask you to authenticate with your github account and sign a message with your Obyte address. Choose <i>public</i> attestation when asked by the bot. Then, the bot will post an attestation transaction.</p>
  <Image src="/bot.jpg" preview={false} alt="Attestation bot" style={{ maxWidth: 320 }} />
  <p>After successful attestation, you will automatically proceed to the next step.</p>

</div>)