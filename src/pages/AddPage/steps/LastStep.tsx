import github, { ISearchResultItem } from "api/github";
import { useState, useEffect, useCallback } from "react";
import { Select, Spin, Form, Typography, Row, Col, Input, Button, message, Image } from "antd";
import { CheckCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from "react-redux";

import { selectGithubUser } from "store/slices/settingsSlice";
import { Agent, IPool } from "api/agent";
import { selectObyteTokens } from 'store/slices/tokensSlice';
import { truncate, generateBannerCode } from "utils";
import { ChangeRules } from "components/ChangeRules/ChangeRules";
import config from "config";


interface IReposList {
  status: "loading" | "loaded",
  data: ISearchResultItem[]
}

interface ILoadedRulesExist {
  isExist: boolean;
  status: "loading" | "loaded";
}

interface ILoadedPools {
  pools: IPool[];
  status: "loading" | "loaded";
}

export const LastStep = () => {
  const [selectedRepoName, setSelectedRepoName] = useState<string | undefined>();
  const [reposList, setReposList] = useState<IReposList>({ status: "loading", data: [] });
  const [pools, setPools] = useState<ILoadedPools>({ pools: [], status: "loading" });
  const [rulesExist, setRulesExist] = useState<ILoadedRulesExist>({ isExist: false, status: "loading" });

  const githubUser = useSelector(selectGithubUser);
  const tokens = useSelector(selectObyteTokens);


  const getUserRepos = useCallback(() => githubUser && github.getReposListByUser(githubUser).then((data) => {
    setReposList({ status: "loaded", data });
  }), [githubUser]);

  const getPools = useCallback(() => selectedRepoName && Agent.getPoolsByFullName(selectedRepoName).then((pools) => setPools({ pools, status: "loaded" })), [selectedRepoName]);

  const getRules = useCallback(async () => {
    if (selectedRepoName) {
      setRulesExist({ isExist: false, status: "loading" })
      await Agent.getRules(selectedRepoName).then(([_, isExist]) => setRulesExist({ status: "loaded", isExist }));
    }
  }, [selectedRepoName])

  setInterval(getRules, 1000 * 60 * 10)

  useEffect(() => {
    getPools();
    getRules();
  }, [selectedRepoName, getPools, getRules])

  useEffect(() => {
    if (githubUser && getUserRepos) {
      getUserRepos();
    }
  }, [getUserRepos, githubUser])

  const options = reposList.data.map(d => <Select.Option key={`add-page-${d.title}`} value={d.title}>
    <div>{d.title}</div>
    <small style={{ color: "#7f8c8d" }}>{typeof d.description === "string" ? d.description : "No description"}</small>
  </Select.Option>);

  const bannerCode = selectedRepoName && generateBannerCode(selectedRepoName);

  return <div>
    <Form>
      <Form.Item>
        <Select value={selectedRepoName} placeholder="Select a repository" showSearch={true} style={{ width: "100%" }} size="large" loading={reposList.status === "loading"} onChange={(value) => setSelectedRepoName(value)}>
          {options}
        </Select>
      </Form.Item>
    </Form>

    {selectedRepoName && <div>
      {rulesExist.status !== "loading" && pools.status !== "loading" ? <div>

        {pools.pools?.length > 0 && <div><b>Donated so far: </b>{pools.pools.map((pool) => <span key={`donated-so-far-${pool.asset}`}>{(tokens && tokens[pool.asset]) ? `${pool.amount / 10 ** tokens[pool.asset].decimals} ${tokens[pool.asset].symbol}` : `${pool.amount} ${truncate(pool.asset, 15)}`}; </span>)}</div>}

        {!rulesExist.isExist && <div style={{ marginTop: 30, maxWidth: 700 }}>
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
                  <CopyToClipboard text={bannerCode} onCopy={() => message.success("The banner has been copied to the clipboard")}>
                    <Button size="small" type="dashed" block><CopyOutlined/> Copy</Button>
                  </CopyToClipboard>
                </Form.Item>}
              </Form>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 12 }}>
              <Image src={`${config.backend_url}/banner?repo=${selectedRepoName}`} preview={false} alt="Cascading donation" />
            </Col>
          </Row>
        </div>


      </div> : <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
        <Spin size="large" />
      </div>}
    </div>}
  </div>
}



