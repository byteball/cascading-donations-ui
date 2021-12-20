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
import { addFavorite, removeFavorite, selectFavorites, selectGithubUser } from "store/slices/settingsSlice";
import { selectEvents } from "store/slices/responsesSlice";
import { EventList } from "components/Event/Event";
import { IEvent } from 'utils/responseToEvent';
import { SettingsModal } from "modals";

import { NotFound } from "components/NotFound/NotFound";
import { IParsedRule } from "components/Recipient/Recipient";
import { Agent } from "api/agent";
import Github from 'api/github';

import styles from "./RepositoryPage.module.css";

const DonateModal = lazy(() => import('modals/DonateModal/DonateModal'));
const Recipients = lazy(() => import('./Recipients'));

interface ILoadedRules {
  rules: IParsedRule[],
  status: "loading" | "loaded"
}

export const RepositoryPage: React.FC = () => {
  let { owner, name } = useParams();
  owner = owner?.toLowerCase();
  name = name?.toLowerCase();
  const [basicInfo, setBasicInfo] = useState<IRepoInfo>();
  const [contributors, setContributors] = useState<IContributor[]>();
  const [isFullSetup, setIsFullSetup] = useState<boolean>(false);
  const [rules, setRules] = useState<ILoadedRules>({ status: "loading", rules: [] })

  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const recentEvents = useSelector(selectEvents);
  const githubUser = useSelector(selectGithubUser);

  const getBasicInformation = useCallback(async () => await Github.getBasicInformation(owner + "/" + name).then(data => setBasicInfo(data)), [owner, name]);
  const getContributors = useCallback(async () => await Github.getContributors(owner + "/" + name).then(data => setContributors(data)), [owner, name]);
  const checkFullSetup = useCallback(async () => await Github.checkBanner(owner + "/" + name).then(data => setIsFullSetup(data)), [owner, name]);

  const getRules = useCallback(async () => {
    if (owner && name) {
      setRules({ rules: [], status: "loading" })
      await Agent.getRules(owner + "/" + name).then(([rules]) => setRules({ status: "loaded", rules: Object.entries(rules).map(([repo, percent]) => ({ repo, percent })) }));
    }
  }, [owner, name])


  useInterval(getRules, 1000 * 60 * 15);

  useEffect(() => {
    if (owner && name) {
      getBasicInformation();
      getContributors();
      checkFullSetup();
      getRules();
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
      action: fullName
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
            <a href={`https://github.com/${fullName}`} target="_blank" rel="noopener">{truncate(fullName, 25)}</a> {isFullSetup && <Tooltip title="Fully setup. Maintainer added banner to README.md file."><CheckCircleOutlined style={{ color: "#0037ff", marginLeft: 5, height: "auto" }} /></Tooltip>}
          </Typography.Title>
        </div>

        <Space size="large">
          {githubUser === owner && <SettingsModal fullName={fullName} />}
          {isFavorite ? <StarFilled onClick={() => dispatch(removeFavorite(fullName))} style={{ fontSize: 24, color: "#f1c40f", cursor: "pointer" }} /> : <StarFilled style={{ fontSize: 24, color: "#ddd" }} onClick={addToFavorites} />}
          <DonateModal owner={owner} name={name} />
        </Space>
      </div>

      <div className={styles.basicInfo}>
        <div className={styles.description}>{basicInfo.description || "No description"}</div>
        <div className={styles.actionsWrap}>
          {basicInfo.language && <div className={styles.action}>{basicInfo.language}</div>}
          <div className={styles.action}>{basicInfo.stargazers_count} <StarOutlined /></div>
          <div className={styles.action}>{basicInfo.forks_count} <ForkOutlined /></div>
        </div>
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