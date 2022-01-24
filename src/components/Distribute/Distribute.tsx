import { useEffect, useState } from "react";
import { Select, Spin, Form, Empty, Result } from "antd";
import QRButton from "obyte-qr-button";
import { useSelector } from "react-redux";
import ReactGA from "react-ga";
import { useInterval } from 'usehooks-ts';

import { selectWalletAddress } from "store/slices/settingsSlice";
import { selectObyteTokens } from 'store/slices/tokensSlice';
import { Agent, IPool } from "api/agent";
import { generateLink, truncate } from "utils";
import config from "config";


interface IDistribute {
  fullName: string;
}

interface IParsedRule {
  repo: string;
  percent: number;
}

interface ILoadedRules {
  rules: IParsedRule[];
  status: "loading" | "loaded";
  exists: boolean;
}

interface ILoadedPools {
  pools: IPool[];
  status: "loading" | "loaded";
}

export const Distribute: React.FC<IDistribute> = ({ fullName }) => {
  const [pools, setPools] = useState<ILoadedPools>({ pools: [], status: "loading" });
  const [selectedPool, setSelectedPool] = useState<IPool | undefined>(undefined);
  const [rules, setRules] = useState<ILoadedRules>({ rules: [], status: "loading", exists: false });

  const tokens = useSelector(selectObyteTokens);
  const walletAddress = useSelector(selectWalletAddress);

  const getPools = () => Agent.getPoolsByFullName(fullName).then((pools) => {
    setPools({ pools, status: "loaded" })
    if (selectedPool) {
      setSelectedPool(pools.find((pool) => pool.asset === selectedPool.asset));
    }
  });

  const getRules = async () => {
    setRules({ rules: [], status: "loading", exists: false });
    await Agent.getRules(fullName).then(([rules, exists]) => setRules({ status: "loaded", rules: Object.entries(rules).map(([repo, percent]) => ({ repo, percent })), exists }));
  }

  useEffect(() => {
    getPools();
    getRules();
  }, []);

  useInterval(getPools, 5 * 1000 * 60);

  const link = generateLink({ amount: 1e4, data: { asset: selectedPool?.asset, distribute: 1, repo: String(fullName).toLowerCase() }, aa: config.aa_address, from_address: walletAddress });

  const selectedPoolAssetInfo = tokens && selectedPool ? tokens[selectedPool.asset] : null;

  if (pools.status === "loading" || rules.status === "loading") return <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: "20px" }}><Spin size="large" /></div>

  if (!rules.exists) {
    return <Result
      status="warning"
      subTitle="Please set up the distribution rules first"
    />
  }

  if (pools.status === "loaded" && pools.pools.length === 0) return <Empty description="No undistributed donations yet" />

  const sendDistributeEventToGA = () => {
    ReactGA.event({
      category: "Manage",
      action: "Distribute",
      label: fullName
    })
  }

  return <div>
    <Form>
      <Form.Item>
        <Select showSearch={true} optionFilterProp="children" placeholder="Select a pool" style={{ width: "100%" }} size="large" value={selectedPool?.asset} onChange={(asset) => setSelectedPool(pools.pools.find((pool) => pool.asset === asset))}>
          {pools.pools.map((pool) => <Select.Option key={`option-${pool.asset}`} value={pool.asset}>{(tokens && tokens[pool.asset]) ? `${pool.amount / 10 ** tokens[pool.asset].decimals} ${tokens[pool.asset].symbol}` : `${pool.amount} ${truncate(pool.asset, 15)}`}</Select.Option>)}
        </Select>
      </Form.Item>
    </Form>

    {selectedPool && <div style={{ marginBottom: 10 }}>
      <div style={{ marginTop: 10 }}>
        {rules.rules.sort((a, b) => b.percent - a.percent).map((rule) => (<div key={`${fullName}-item-distribute`} style={{ paddingTop: 2, paddingBottom: 2 }}>
          <b>{rule.repo === fullName ? "You" : rule.repo}</b> will receive <b>{selectedPoolAssetInfo ? `${+Number(selectedPool.amount * rule.percent / 100).toFixed(selectedPoolAssetInfo.decimals) / 10 ** selectedPoolAssetInfo.decimals} ${selectedPoolAssetInfo.symbol}` : `${selectedPool.amount * rule.percent / 100} ${truncate(selectedPool.asset, 15)}`}</b>
        </div>))}
      </div>
    </div>}

    <QRButton size="large" type="primary" disabled={selectedPool === undefined || rules.rules.length === 0 || !selectedPool.amount} href={link} onClick={sendDistributeEventToGA}>Distribute</QRButton>
  </div>
}