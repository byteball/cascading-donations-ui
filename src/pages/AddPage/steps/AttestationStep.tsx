import config from "config"

export const AttestationStep: React.FC = () => (<div>
  <p>To link your wallet with a github user, you need to pass attestation.</p>
  <div><b>It is very easy to do this:</b></div>
  <ol>
    <li style={{ padding: 5 }}><a href={config.pairing_url}>Pair with GitHub attestation bot</a></li>
    <li style={{ padding: 5 }}>Authenticate with GitHub from chat bot</li>
    <li style={{ padding: 5 }}>Sign a message to verify Obyte wallet address</li>
  </ol>
  <div><i>After successful attestation, you will automatically proceed to the next step</i></div>
</div>)