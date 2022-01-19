import github, { ISearchResultItem } from "api/github";
import { useState, useEffect, useCallback, memo } from "react";
import { Select, Spin, Form, Typography, Row, Col, Input, Button, message, Image } from "antd";
import { CheckCircleOutlined, CopyOutlined, SearchOutlined } from "@ant-design/icons";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from "react-redux";
import { debounce } from 'lodash';

import { selectActiveGithubUser } from "store/slices/settingsSlice";
import { Agent, IPool } from "api/agent";
import { selectObyteTokens } from 'store/slices/tokensSlice';
import { truncate, generateBannerCode } from "utils";
import { ChangeRules } from "components/ChangeRules/ChangeRules";
import { GithubUserSwitch } from "components/GithubUserSwitch/GithubUserSwitch";
import config from "config";

import styles from "../AddPage.module.css";

interface IReposList {
  status: "loading" | "loaded",
  data: ISearchResultItem[]
}

interface ILoadedRulesExist {
  exist: boolean;
  status: "loading" | "loaded";
}

interface ILoadedPools {
  pools: IPool[];
  status: "loading" | "loaded";
}

export const LastStep = memo(() => {
  const [selectedRepoName, setSelectedRepoName] = useState<string | undefined>();
  const [reposList, setReposList] = useState<IReposList>({ status: "loading", data: [] });
  const [pools, setPools] = useState<ILoadedPools>({ pools: [], status: "loading" });
  const [rulesExist, setRulesExist] = useState<ILoadedRulesExist>({ exist: false, status: "loading" });
  const [exhausted, setExhausted] = useState<boolean>(false);
  const activeGithubUser = useSelector(selectActiveGithubUser);
  const tokens = useSelector(selectObyteTokens);


  const getUserRepos = useCallback(() => activeGithubUser && github.getReposListByUser(activeGithubUser).then((data) => {
    setReposList({ status: "loaded", data });
    setExhausted(false);
  }).catch(() => { setExhausted(true); }), [activeGithubUser]);

  const getPools = useCallback(() => selectedRepoName && Agent.getPoolsByFullName(selectedRepoName).then((pools) => setPools({ pools, status: "loaded" })), [selectedRepoName]);

  const getRules = useCallback(async () => {
    if (selectedRepoName) {
      setRulesExist({ exist: false, status: "loading" })
      await Agent.getRules(selectedRepoName).then(([_, exist]) => setRulesExist({ status: "loaded", exist }));
    }
  }, [selectedRepoName])

  setInterval(async () => {
    if (selectedRepoName && !rulesExist.exist) {
      await Agent.getRules(selectedRepoName).then(([_, exist]) => exist && setRulesExist({ status: "loaded", exist }));
    }
  }, 1000 * 60 * 10)

  useEffect(() => {
    getPools();
    getRules();
  }, [selectedRepoName, getPools, getRules])

  useEffect(() => {
    if (activeGithubUser && getUserRepos) {
      getUserRepos();
      setSelectedRepoName(undefined);
    }
  }, [getUserRepos, activeGithubUser])

  const bannerCode = selectedRepoName && generateBannerCode(selectedRepoName);

  const handleSearch = async (query?: string) => {
    setReposList(s => ({ ...s, status: "loading" }));
    if (activeGithubUser && query) {
      Agent.getManagementList(activeGithubUser, query).then(data => { setReposList({ status: "loaded", data }); if (exhausted) setExhausted(false); }).catch(() => { setExhausted(true); })
    } else if (activeGithubUser && !query) {
      Agent.getManagementList(activeGithubUser).then(data => { setReposList({ status: "loaded", data }); if (exhausted) setExhausted(false); }).catch(() => { setExhausted(true); })
    }
  }

  return <div>
    <GithubUserSwitch />

    <Form>
      <Form.Item style={{ width: "100%" }} extra={exhausted ? <span style={{ color: "red" }}>You have reached the limit of search queries, please try again in a couple of minutes</span> : ""}>
        <Select
          defaultActiveFirstOption={false}
          notFoundContent={false}
          value={selectedRepoName}
          placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Search a repository"
          className={styles.select}
          showSearch={true}
          style={{ width: "100%" }}
          size="large"
          suffixIcon={<SearchOutlined style={{ fontSize: 16 }} />}
          loading={reposList.status === "loading"}
          onChange={(value) => { setSelectedRepoName(value); handleSearch("") }}
          onSearch={debounce(handleSearch, 800)}
        >
          {reposList.data.map(d => <Select.Option key={`add-page-${d.title}`} value={d.title}>
            <div>{d.title.split("/")?.[1]}</div>
            <small style={{ color: "#7f8c8d" }}>{typeof d.description === "string" ? d.description : "No description"}</small>
          </Select.Option>)}
        </Select>
      </Form.Item>
    </Form>

    {selectedRepoName && <div>
      {rulesExist.status !== "loading" && pools.status !== "loading" ? <div>

        {pools.pools?.length > 0 && <div><b>Donated so far: </b>{pools.pools.map((pool) => <span key={`donated-so-far-${pool.asset}`}>{(tokens && tokens[pool.asset]) ? `${pool.amount / 10 ** tokens[pool.asset].decimals} ${tokens[pool.asset].symbol}` : `${pool.amount} ${truncate(pool.asset, 15)}`}; </span>)}</div>}

        {!rulesExist.exist && <div style={{ marginTop: 30, maxWidth: 700 }}>
          <Typography.Title level={3}>Set up distribution rules for {selectedRepoName}</Typography.Title>
          <ChangeRules fullName={selectedRepoName} />
        </div>}

        <div style={{ marginTop: 30 }}>
          <Typography.Title level={3}>Donation button for  {selectedRepoName}</Typography.Title>
          <p>
            To request donations and display a fully setup checkmark <CheckCircleOutlined style={{ color: "#0037ff" }} /> next to your repo, please add this code to your README.md:
          </p>
          <Row gutter={30}>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 12 }} style={{ marginBottom: 30 }}>
              <Form>
                <Form.Item>
                  <Input.TextArea value={bannerCode} />
                </Form.Item>

                {bannerCode && <Form.Item>
                  <CopyToClipboard text={bannerCode} onCopy={() => message.success("The banner code has been copied to the clipboard")}>
                    <Button size="small" type="dashed" block><CopyOutlined /> Copy</Button>
                  </CopyToClipboard>
                </Form.Item>}
              </Form>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 12 }}>
              <Image src={`${config.backend_url}/banner?repo=${selectedRepoName}`} preview={false} alt="Cascading donations" />
            </Col>
          </Row>
        </div>

      </div> : <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
        <Spin size="large" />
      </div>}
    </div>}
  </div>
})



