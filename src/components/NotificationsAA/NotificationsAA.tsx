import { Form, Input } from "antd";
import { useEffect, useState } from 'react';
import QRButton from 'obyte-qr-button';
import obyte from 'obyte';
import { useSelector } from 'react-redux';

import { Agent } from "api/agent";
import { generateLink } from 'utils';
import config from "config";
import { selectWalletAddress } from "store/slices/settingsSlice";

interface INotificationsAA {
  fullName: string;
}

export const NotificationsAA: React.FC<INotificationsAA> = ({ fullName }) => {
  const [aaAddress, setAaAddress] = useState({ valid: false, value: "" });
  const walletAddress = useSelector(selectWalletAddress);

  const getNotificationAA = () => Agent.getNotificationAAByRepo(fullName).then(aa => aa && setAaAddress({ valid: true, value: aa }));

  useEffect(() => {
    getNotificationAA();
  }, [fullName]);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setAaAddress({
      valid: obyte.utils.isValidAddress(ev.target.value),
      value: ev.target.value
    })
  }

  const link = generateLink({ amount: 1e4, data: { notification_aa: aaAddress.value, distribute: 1, repo: String(fullName).toLowerCase() }, aa: config.aa_address, from_address: walletAddress });

  return <div>
    <p>
      Optionally set up an AA to receive notifications about every donation. The AA might perform any action you choose, for example issue a token to the donor or track statistics.
    </p>

    <p>
      AAs are written in <a target="_blank" href="https://developer.obyte.org/autonomous-agents/getting-started-guide" rel="noopener">oscript</a> language. <a href="https://oscript.org/s/ayduFGpeBpnB7UYu7PUGYWorBL4UMkKS" target="_blank" rel="noopener">This is an example</a> of an AA that issues a token in response to donations.
    </p>
    <Form>
      <Form.Item validateStatus={aaAddress.value ? (aaAddress.valid ? "success" : "error") : ""}>
        <Input size="large" value={aaAddress.value} placeholder="AA address" onChange={handleChange} />
      </Form.Item>
      <Form.Item>
        <QRButton type="primary" href={link} disabled={!aaAddress.valid}>Change AA</QRButton>
      </Form.Item>
    </Form>
  </div>
}