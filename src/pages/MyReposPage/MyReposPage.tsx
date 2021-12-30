import { Typography, Button, Form, Input, Tag, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useInterval } from 'usehooks-ts';
import { useSelector, useDispatch } from 'react-redux';
import { SearchOutlined } from "@ant-design/icons";
import { debounce } from 'lodash';

import { ISearchResultItem } from 'api/github';
import { removeFilter, selectActiveGithubUser, selectFilters } from "store/slices/settingsSlice";
import { RepositoryFiltersModal } from "modals/RepositoryFiltersModal/RepositoryFiltersModal";
import { Agent, IPool } from 'api/agent';
import { selectObyteTokens } from "store/slices/tokensSlice";
import { truncate } from 'utils/truncate';
import { SettingsModal } from "modals";
import { GithubUserSwitch } from "components/GithubUserSwitch/GithubUserSwitch";

import styles from "./MyReposPage.module.css";
interface ISearchResultItemWithData extends ISearchResultItem {
  rulesAreSet: boolean;
  pools: IPool[];
}

export const MyReposPage = () => {
  const [repoList, setRepoList] = useState<ISearchResultItemWithData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [exhausted, setExhausted] = useState<boolean>(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activeGithubUser = useSelector(selectActiveGithubUser);
  const filters = useSelector(selectFilters);
  const tokens = useSelector(selectObyteTokens);

  const getManagementList = useCallback(() => activeGithubUser && Agent.getManagementList(activeGithubUser).then(data => {
    setRepoList(data);
    setLoading(false);
    setSearchQuery("");

    if (inputRef.current) {
      // @ts-ignore
      inputRef.current.input.value = "";
      // @ts-ignore
      inputRef.current.state.value = "";
    }
  }), [activeGithubUser]);

  useEffect(() => {
    setLoading(true);
    getManagementList();
  }, [getManagementList])

  useInterval(() => activeGithubUser && Agent.getManagementList(activeGithubUser, searchQuery).then(data => { setRepoList(data); setLoading(false); if (exhausted) setExhausted(false); }).catch(() => setExhausted(true)), 10 * 60 * 1000);

  if (!activeGithubUser) {
    navigate("/add");
    return null;
  }

  const resultList = repoList.filter(repo => (filters.haveDonations !== "all" ? (filters.haveDonations ? repo.pools && repo.pools.length > 0 : !repo.pools) : true) && (filters.areSetRules !== "all" ? repo.rulesAreSet === filters.areSetRules : true) && (filters.tokens.length > 0 ? ((!repo.pools || repo.pools.length === 0) ? false : repo.pools.find((pool) => filters.tokens.includes(pool.asset))) : true)).sort((a, b) => (b.pools?.length || 0) - (a.pools?.length || 0));

  const handleSearch = async (ev: React.ChangeEvent<HTMLInputElement>) => {

    const query = ev.target.value;
    setLoading(true);
    setSearchQuery(query);
    Agent.getManagementList(activeGithubUser, query).then(data => { setRepoList(data); setLoading(false) }).catch(() => setExhausted(true))
    setLoading(false);

    if (exhausted) {
      setExhausted(false)
    }
  }

  return <div>
    <Helmet>
      <title>Kivach - My repositories</title>
    </Helmet>
    <Typography.Title>My repositories</Typography.Title>

    <GithubUserSwitch />

    <Form size="large" layout="inline" style={{ marginBottom: 15 }}>
      <Form.Item style={{ flex: 1 }} extra={exhausted ? <span style={{ color: "red" }}>You have reached the limit of search queries, please try again in a couple of minutes</span> : ""}>
        <Input allowClear ref={inputRef} placeholder="Filter by repo name/description" prefix={<SearchOutlined style={{ color: "#D9D9D9" }} />} style={{ marginBottom: 5 }} onChange={debounce(handleSearch, 800)} />
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
      <Form.Item style={{ marginRight: 0 }}>
        <RepositoryFiltersModal />
      </Form.Item>
    </Form>

    {!loading ? <div>
      {resultList.map(({ title: fullName, rulesAreSet, pools, description }) => <div key={`list-item-${fullName}`} className={styles.item}>
        <div className={styles.repoInfo}>
          <div><Link className={styles.repoName} to={`/repo/${fullName}`}>{fullName.split("/")?.[1]}</Link></div>
          <div className={styles.desc}>{description || "No description"}</div>
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