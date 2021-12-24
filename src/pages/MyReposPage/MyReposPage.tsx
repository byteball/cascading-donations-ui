import { Avatar, Typography, Button, Form, Input, Tag, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useInterval } from 'usehooks-ts';
import { useSelector, useDispatch } from 'react-redux';

import { ISearchResultItem } from 'api/github';
import { removeFilter, selectFilters, selectGithubUser, selectWalletAddress } from "store/slices/settingsSlice";
import { RepositoryFiltersModal } from "modals/RepositoryFiltersModal/RepositoryFiltersModal";
import { Agent, IPool } from 'api/agent';
import { selectObyteTokens } from "store/slices/tokensSlice";
import { truncate } from 'utils/truncate';
import { SettingsModal } from "modals";

import styles from "./MyReposPage.module.css";

interface ISearchResultItemWithData extends ISearchResultItem {
  rulesAreSet: boolean;
  pools: IPool[];
}

export const MyReposPage = () => {
  const [repoList, setRepoList] = useState<ISearchResultItemWithData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const githubUser = useSelector(selectGithubUser);
  const currentWalletAddress = useSelector(selectWalletAddress);
  const filters = useSelector(selectFilters);
  const tokens = useSelector(selectObyteTokens);

  const getManagementList = useCallback(() => githubUser && Agent.getManagementList(githubUser).then(data => { setRepoList(data); setLoading(false) }), [githubUser]);

  useInterval(getManagementList, 10 * 60 * 1000)

  useEffect(() => {
    setLoading(true);
    getManagementList();
  }, [getManagementList])

  const searchResults = searchQuery !== "" ? repoList.filter((repo) => repo.title.split("/")[1].includes(searchQuery)) : repoList;

  const resultList = searchResults.filter(repo => (filters.haveDonations !== "all" ? (filters.haveDonations ? repo.pools && repo.pools.length > 0 : !repo.pools) : true) && (filters.areSetRules !== "all" ? repo.rulesAreSet === filters.areSetRules : true) && (filters.tokens.length > 0 ? ((!repo.pools || repo.pools.length === 0) ? false : repo.pools.find((pool) => filters.tokens.includes(pool.asset))) : true)).sort((a, b) => (b.pools?.length || 0) - (a.pools?.length || 0));

  if (!githubUser) {
    navigate("/add")
  }

  return <div>
    <Helmet>
      <title>Kivach - My repositories</title>
    </Helmet>
    <Typography.Title>My repositories</Typography.Title>
    <div className={styles.headerWrap}>
      <Avatar className={styles.avatar} size={40} src={`https://avatars.githubusercontent.com/${githubUser}`} alt="" />
      <div className={styles.headerInfo}>
        <div className={styles.githubName}>{githubUser}</div>
        <div className={styles.wallet}>{currentWalletAddress}</div>
      </div>
    </div>

    <Form size="large" layout="inline" style={{ marginBottom: 15 }}>
      <Form.Item style={{ flex: 1 }}>
        <Input placeholder="Filter by repo name" style={{ marginBottom: 5 }} onChange={(ev) => setSearchQuery(ev.target.value)} />
        {filters.haveDonations !== "all" && <Tag closable onClose={() => dispatch(removeFilter({ type: "haveDonations" }))}>
          Donations: {filters.haveDonations ? "YES" : "NO"}
        </Tag>}
        {filters.areSetRules !== "all" && <Tag closable onClose={() => dispatch(removeFilter({ type: "areSetRules" }))}>
          Rules are set: {filters.areSetRules ? "YES" : "NO"}
        </Tag>}

        {tokens && filters?.tokens?.map((asset: string) => (<Tag closable key={`tag-${asset}`} onClose={() => dispatch(removeFilter({ type: "tokens", value: asset }))}>
          {tokens[asset].symbol}
        </Tag>))}
      </Form.Item>
      <Form.Item>
        <RepositoryFiltersModal />
      </Form.Item>
    </Form>

    {!loading ? <div>
      {resultList.map(({ title: fullName, rulesAreSet, pools, description }) => <div key={`list-item-${fullName}`} className={styles.item}>
        <div className={styles.repoInfo}>
          <div><Link className={styles.repoName} to={`/repo/${fullName}`}>{fullName.split("/")?.[1]}</Link></div>
          <div className={styles.desc}>{description || "No description"}</div>
          {/* <div className={styles.desc}>{(pools && pools.length > 0) ? `Pending distribute: ${pools?.map((pool) => (tokens && tokens[pool.asset]?.symbol) || truncate(pool.asset, 7)).join(", ")}` : "No assets pending distribution"}</div> */}
        </div>
        {pools && pools.length > 0 && <div className={styles.pools}>
          {pools.sort((a, b) => (b.amount / (10 ** ((tokens && tokens[b.asset]?.decimals) || 0))) - (a.amount / (10 ** ((tokens && tokens[a.asset]?.decimals) || 0)))).slice(0, 3).map(({ asset, amount }) => <div key={asset}>{+Number(amount / (10 ** ((tokens && tokens[asset]?.decimals) || 0))).toFixed(8)} <small>{(tokens && tokens[asset]?.symbol) || truncate(asset, 7)}</small></div>)}
          {pools.length > 3 && <div>...</div>}
        </div>}
        <div className={styles.actionsWrap}>
          <div className={styles.tagsWrap}>
            {!rulesAreSet && <Tag color="warning">No distribution rules</Tag>}
          </div>
          <SettingsModal fullName={fullName}>
            <Button type="primary">Manage</Button>
          </SettingsModal>
        </div>
      </div>)}
    </div> : <div className={styles.loaderWrap}>
      <Spin size="large" />
    </div>}
  </div>
}