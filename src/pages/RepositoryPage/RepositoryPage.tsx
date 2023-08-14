import { CheckCircleOutlined, ForkOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Avatar, Space, Spin, Tooltip, Typography } from "antd";
import { useParams } from "react-router"
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useInterval } from 'usehooks-ts';
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from 'react-helmet-async';
import ReactGA from "react-ga";

import { getAvatarLink, truncate } from "utils";
import { IContributor, IRepoInfo } from 'store/slices/cacheSlice';
import { ContributorList } from "components/Contributor/Contributor";
import { addFavorite, removeFavorite, selectFavorites, selectGithubUsers } from "store/slices/settingsSlice";
import { selectObyteTokens } from "store/slices/tokensSlice";
import { selectEvents } from "store/slices/responsesSlice";
import { EventList } from "components/Event/Event";
import { IEvent } from 'utils/responseToEvent';
import { SettingsModal } from "modals";

import { NotFound } from "components/NotFound/NotFound";
import { IParsedRule } from "components/Recipient/Recipient";
import { Agent, tokenAmounts } from "api/agent";
import Github from 'api/github';

import styles from "./RepositoryPage.module.css";

const DonateModal = lazy(() => import('modals/DonateModal/DonateModal'));
const Recipients = lazy(() => import('./Recipients'));

interface ILoadedRules {
  rules: IParsedRule[],
  status: "loading" | "loaded"
}

interface ITotalsState {
  received: number;
  undistributed: number;
  receivedTokens: tokenAmounts;
  undistributedTokens: tokenAmounts;
  loading: boolean;
}


export const RepositoryPage: React.FC = () => {
  let { owner, name } = useParams();
  owner = owner?.toLowerCase();
  name = name?.toLowerCase();
  const [basicInfo, setBasicInfo] = useState<IRepoInfo>();
  const [contributors, setContributors] = useState<IContributor[]>();
  const [isFullSetup, setIsFullSetup] = useState<boolean>(false);
  const [rules, setRules] = useState<ILoadedRules>({ status: "loading", rules: [] })
  const [totals, setTotals] = useState<ITotalsState>({ received: 0, undistributed: 0, receivedTokens: [], undistributedTokens: [], loading: true });

  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const recentEvents = useSelector(selectEvents);
  const githubUsers = useSelector(selectGithubUsers);
  const tokensOnObyteNetwork = useSelector(selectObyteTokens);

  const getBasicInformation = useCallback(async () => await Github.getBasicInformation(owner + "/" + name).then(data => setBasicInfo(data)), [owner, name]);
  const getContributors = useCallback(async () => await Github.getContributors(owner + "/" + name).then(data => setContributors(data)), [owner, name]);
  const checkFullSetup = useCallback(async () => await Github.checkBanner(owner + "/" + name).then(data => setIsFullSetup(data)), [owner, name]);

  const getRules = useCallback(async (isHttpRequest: boolean = false) => {
    if (owner && name && tokensOnObyteNetwork) {
      setRules({ rules: [], status: "loading" });
      setTotals({ received: 0, undistributed: 0, receivedTokens: [], undistributedTokens: [], loading: true });

      await Agent.getRules(owner + "/" + name, isHttpRequest).then(([rules]) => setRules({ status: "loaded", rules: Object.entries(rules).map(([repo, percent]) => ({ repo, percent })) }));
      await Agent.getTotalReceivedByFullName(owner + "/" + name, tokensOnObyteNetwork || {}).then(data => setTotals({ received: data.received, undistributed: data.undistributed, receivedTokens: data.receivedTokens, undistributedTokens: data.undistributedTokens, loading: false })).catch(() => setTotals({ received: 0, undistributed: 0, receivedTokens: [], undistributedTokens: [], loading: true }));
    }
  }, [owner, name, tokensOnObyteNetwork]);


  useInterval(getRules, 1000 * 60 * 15);

  useEffect(() => {
    if (owner && name) {
      getBasicInformation();
      getContributors();
      checkFullSetup();
      getRules(true);
    }
  }, [getBasicInformation, getContributors, checkFullSetup, getRules])

  if (!owner || !name || (basicInfo?.full_name && basicInfo.created_at === undefined)) return <NotFound />

  if (basicInfo === undefined || contributors === undefined || rules.status === "loading") return <div style={{ width: "100%", marginTop: "25%", display: "flex", justifyContent: "center" }}><Spin size="large" style={{ transform: "scale(1.5)" }} /></div>

  const fullName = owner + "/" + name;

  const isFavorite = favorites.includes(fullName);

  const avatarUrl = getAvatarLink(owner);

  const addToFavorites = () => {
    dispatch(addFavorite(fullName));

    ReactGA.event({
      category: "Favorites",
      action: `fav ${fullName}`
    })
  }

  return <>
    <Helmet>
      <title>Kivach - {fullName}</title>
    </Helmet>
    <Suspense fallback={<div style={{ width: "100%", marginTop: "25%", display: "flex", justifyContent: "center" }}><Spin size="large" style={{ transform: "scale(1.5)" }} /></div>}>
      <div className={styles.headerWrap}>
        <div className={styles.header}>
          <Avatar src={avatarUrl} size={70} className={styles.avatar} />
          <Typography.Title level={1} className={styles.title}>
            <a href={`https://github.com/${fullName}`} target="_blank" rel="noopener">{truncate(fullName, 25)}</a> {isFullSetup && <Tooltip title="Fully setup. Maintainer has added a banner to their README."><CheckCircleOutlined style={{ color: "#0037ff", marginLeft: 5, height: "auto" }} /></Tooltip>}
          </Typography.Title>
        </div>

        <Space size="large">
          {githubUsers.includes(owner) && <SettingsModal fullName={fullName} />}
          {isFavorite ? <StarFilled onClick={() => dispatch(removeFavorite(fullName))} style={{ fontSize: 24, color: "#f1c40f", cursor: "pointer" }} /> : <StarFilled style={{ fontSize: 24, color: "#ddd" }} onClick={addToFavorites} />}
          <DonateModal owner={owner} name={name} />
        </Space>
      </div>

      <div className={styles.basicInfoWrap}>
        <div className={styles.basicInfo}>
          <div className={styles.description}>{basicInfo.description || "No description"}</div>
          <div className={styles.actionsWrap}>
            {basicInfo.language && <div className={styles.action}>{basicInfo.language}</div>}
            <div className={styles.action}>{basicInfo.stargazers_count} <StarOutlined /></div>
            <div className={styles.action}>{basicInfo.forks_count} <ForkOutlined /></div>
          </div>
        </div>
        {!totals.loading && <div className={styles.donationInfo}>
          <div className={styles.donationInfoRow}>
            Total donated: {totals.received ? <Tooltip placement="right" title={<span>{totals.receivedTokens.map(({ amount, symbol }) => <div key={symbol}>{amount} {symbol}</div>)}</span>}><span className={styles.underline}> ${+Number(totals.received).toFixed(2)}</span></Tooltip> : '$0'}
          </div>
          <div className={styles.donationInfoRow}>
            Undistributed: {totals.undistributed ? <Tooltip placement="right" title={<span>{totals.undistributedTokens.map(({ amount, symbol }) => <div key={symbol}>{amount} {symbol}</div>)}</span>}><span className={styles.underline}> ${+Number(totals.undistributed).toFixed(2)}</span></Tooltip> : '$0'}
          </div>
        </div>}
      </div>

      <div className={styles.contentBlock}>
        <Typography.Title level={3}>Recipients</Typography.Title>
        <Recipients fullName={fullName} rules={rules.rules} />
      </div>

      <div className={styles.contentBlock}>
        <Typography.Title level={3}>Top contributors</Typography.Title>
        <ContributorList
          data={contributors}
          prefixForKeys="repo-contributors"
        />
      </div>

      <div className={styles.contentBlock}>
        <Typography.Title level={3}>Recent events</Typography.Title>
        <EventList data={recentEvents.filter((x): x is IEvent => x !== null)} filters={{ repository: fullName }} />
      </div>
    </Suspense>
  </>
}