import { Avatar, Button, Input, Modal, Form, Select, Checkbox, message } from "antd";
import { useState, useEffect, useRef, memo } from "react"
import QRButton from "obyte-qr-button";
import { findBridge, findOswapPool, transferEVM2Obyte } from "counterstake-sdk";
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import { getAvatarLink, generateLink, truncate } from "utils";
import { selectTokensData } from "store/slices/tokensSlice";
import { IToken } from "api/backend";
import config from 'config';
import { client } from "obyteInstance";
import { selectIconList } from "store/slices/cacheSlice";
import { selectWalletAddress } from "store/slices/settingsSlice";

import styles from "./DonateModal.module.css";

interface IDonateModal {
  owner: string;
  name: string;
}

type network = "Obyte" | "Ethereum" | "BSC" | "Polygon";

type poolsStatus = "loading" | "exists" | "not-exists"

const f = (x: string) => (~(x + "").indexOf(".") ? (x + "").split(".")[1].length : 0);

const DonateModal: React.FC<IDonateModal> = memo(({ owner, name }) => {
  const [visible, setVisible] = useState(false);
  const [inited, setInited] = useState(false);
  const [convert, setConvert] = useState(true);
  const [network, setNetwork] = useState<network>("Obyte");
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [poolStatus, setPoolStatus] = useState<poolsStatus>("loading")
  const [donationProcessIsActive, setDonationProcessIsActive] = useState<boolean>(false);
  const [amount, setAmount] = useState<string | undefined>();
  const [token, setToken] = useState<IToken | undefined>({ asset: "base", symbol: "GBYTE", decimals: 9 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<Input>(null);
  const tokens = useSelector(selectTokensData);
  const iconList = useSelector(selectIconList);
  const walletAddress = useSelector(selectWalletAddress);

  const fullName = owner + "/" + name;
  const avatarUrl = getAvatarLink(owner);

  const networks = Object.keys(tokens);
  const tokensByNetwork = tokens[network];

  // effects
  useEffect(() => {
    if (inited) {
      setToken(undefined);
      setAmount("");
    } else {
      setInited(true)
    }
  }, [network])

  const findPool = async () => {
    if (token?.obyte_asset) {
      const pool = await findOswapPool(token.obyte_asset, "base", config.testnet, client);
      setPoolStatus(pool ? "exists" : "not-exists");
    }
  }

  const getMaxAmount = async () => {
    if (token && token.asset) {
      if (network !== "Obyte") {
        setMaxAmount(undefined)
        const max_amount = await findBridge(network, "Obyte", token.asset, config.testnet).then(bridge => bridge.max_amount || 0);
        setMaxAmount(max_amount);
      } else {
        setMaxAmount(undefined)
      }
    } else {
      setMaxAmount(undefined);
    }
  }

  useEffect(() => {
    if (network !== "Obyte") {
      setConvert(true);
      setPoolStatus("loading");
      findPool();
      getMaxAmount();
    } else {
      setPoolStatus("not-exists");
    }
  }, [token])

  // handles 
  const handleOpen = () => setVisible(true);

  const handleClose = () => setVisible(false);

  const handleAmount = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    const reg = /^[0-9.]+$/;
    if ((token && value.split(".").length <= 2 && (reg.test(String(value)) && f(value) <= token.decimals)) || value === "") {
      setAmount(value);
    }
  };

  const handleDonate = async () => {
    if (!network || !token || network === "Obyte") return null;
    setDonationProcessIsActive(true);
    if (convert) {
      try {
        await transferEVM2Obyte({
          src_network: network,
          src_asset: token.symbol,
          dst_network: "Obyte",
          dst_asset: "GBYTE",
          amount: amount,
          recipient_address: config.aa_address,
          data: { donate: 1, repo: fullName, donor: walletAddress ? walletAddress : undefined },
          assistant_reward_percent: 1.0,
          testnet: config.testnet,
          obyteClient: client
        });
      } catch ({ message: info }) {
        message.error(info as string)
      }
    } else {
      try {
        await transferEVM2Obyte({
          src_network: network,
          src_asset: token.symbol,
          dst_network: "Obyte",
          amount: amount,
          recipient_address: config.aa_address,
          data: { donate: 1, repo: fullName, donor: walletAddress ? walletAddress : undefined },
          assistant_reward_percent: 1.0,
          testnet: config.testnet,
          obyteClient: client
        });
      } catch ({ message: info }) {
        message.error(info as string)
      }
    }

    setDonationProcessIsActive(false);
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && buttonRef.current) {
      const elements = buttonRef.current.getElementsByTagName(network === "Obyte" ? "a" : "button");
      if (elements.length === 1) {
        elements?.[0]?.click();
      }
    }
  }

  const linkToDonate = token && network === "Obyte" ? generateLink({ amount: Math.ceil(Number(amount) * 10 ** token.decimals) + (token.asset === "base" ? 1e4 : 0), aa: config.aa_address, asset: token?.asset, data: { donate: 1, repo: fullName }, from_address: walletAddress }) : "";

  return <>
    <Button type="primary" size="large" onClick={handleOpen}>
      Donate
    </Button>
    <Modal
      visible={visible}
      title={null}
      footer={null}
      onOk={handleOpen}
      width={600}
      destroyOnClose={true}
      onCancel={handleClose}>

      <Helmet>
        <title>Kivach - Donation to {fullName}</title>
      </Helmet>

      <div className={styles.headerWrapper}>
        <Avatar src={avatarUrl} size={40} className={styles.avatar} />
        <span className={styles.title}>Donate to {truncate(fullName, 25)}</span>
      </div>

      <Form layout="vertical" size="large">
        <span className={styles.label}>Network:</span>
        <Form.Item className="itemWithSelectIcons">
          <Select placeholder="Network" value={network} onChange={(network) => setNetwork(network)}>
            {networks.map((network) => <Select.Option value={network} key={`network-${network}`}>
              <div className={styles.optionWrapper}>
                <img className={styles.icon} src={`/${network}.svg`} alt={network} /> <span>{network}</span>
              </div>
            </Select.Option>)}
          </Select>
        </Form.Item>

        <span className={styles.label}>Token:</span>
        <Form.Item className="itemWithSelectIcons">
          <Select showSearch optionFilterProp="label" placeholder="Token" value={token?.asset} onChange={(asset) => tokensByNetwork?.[asset]?.symbol && setToken({ ...tokensByNetwork?.[asset], asset })}>
            {tokensByNetwork && Object.keys(tokensByNetwork).map((asset) => {
              const symbol = tokensByNetwork?.[asset]?.symbol;
              const iconName = symbol && iconList.find((iconName) => symbol.includes(iconName))

              return <Select.Option key={`donation-token-${asset}-option`} value={asset} label={symbol}>
                <div className={styles.optionWrapper}>
                  <img className={styles.icon} src={iconName ? `${config.icon_cdn_url}/${iconName}.svg` : "/plug.svg"} alt={symbol} /> <span>{symbol}</span>
                </div>
              </Select.Option>
            })}
          </Select>
        </Form.Item>

        <span className={styles.label}>Amount:</span>
        <Form.Item validateStatus={(network !== "Obyte" && maxAmount !== undefined) ? ((Number(amount) > maxAmount) ? "error" : undefined) : undefined} extra={(network !== "Obyte" && maxAmount !== undefined) && ((Number(amount) > maxAmount) ? <span style={{ color: "red" }}>Amount too large, assistants can help with only {maxAmount}</span> : "")}>
          <Input placeholder="Example 10" ref={amountInputRef} value={amount} onChange={handleAmount} disabled={!token} onKeyDown={handleEnter} />
        </Form.Item>

        {poolStatus === "exists" && <Form.Item>
          <Checkbox checked={convert} onChange={(e) => setConvert(e.target.checked)}>Convert to GBYTE</Checkbox>
        </Form.Item>}
      </Form>
      <div ref={buttonRef} className={styles.buttonWrap}>
        {network === "Obyte" ? <QRButton href={linkToDonate} type="primary" disabled={!token || Number(amount) === 0 || amount === "." || typeof amount !== "string"}>Donate</QRButton> : <Button type="primary" loading={donationProcessIsActive || ((maxAmount === undefined) && !!token)} onClick={handleDonate} disabled={poolStatus === "loading" || Number(amount) === 0 || !token || amount === "." || typeof amount !== "string" || maxAmount === undefined || (Number(amount) > (maxAmount || 0))}>Donate</Button>}
      </div>

      <div className={styles.warning}>
        {network === "Obyte"
          ? <small>0.00001 GB will be added as a fee</small>
          : <small>To accept donations from networks other than Obyte, we use a <a target="_blank" href="https://counterstake.org/" rel="noopener">counterstake.org</a>. 1% will be subtracted from the donated amount to pay for the cross-chain transfer and it'll take a bit longer.</small>}
      </div>
    </Modal>
  </>
})

export default DonateModal;