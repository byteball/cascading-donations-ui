import { Col, Row, Form, Select } from "antd"
import { useState, memo } from "react";
import { debounce } from "lodash";
import { useNavigate } from 'react-router-dom';
import ReactGA from "react-ga";
import { SearchOutlined } from "@ant-design/icons";

import github, { ISearchResultItem } from "api/github";
import { ReactComponent as HowIllustration } from './how.svg';

import styles from "./MainSearch.module.css";

const githubUrl = "https://github.com/";

export const MainSearch: React.FC = memo(() => {
  const [data, setData] = useState<ISearchResultItem[]>([]);
  const [exhausted, setExhausted] = useState<boolean>(false);

  const navigate = useNavigate();

  // handlers
  const handleSearch = async (value: any) => {
    try {
      if (value) {
        const includesDomain = value.includes(githubUrl)
        const withoutDomain = value.replace(githubUrl, "");

        if (includesDomain) {
          const [owner, repo] = withoutDomain.split("/");

          if (owner && repo) {
            const exists = await github.existsRepo(withoutDomain);

            if (exists) {
              handleSelect(withoutDomain)
            } else {
              const result = await github.searchRepos(withoutDomain);
              setData(result);
            }
          } else {
            const result = await github.searchRepos(withoutDomain);
            setData(result);
          }
          
        } else {
          const result = await github.searchRepos(value);
          setData(result);
        }
        
      } else {
        setData([]);
      }
      if (exhausted) {
        setExhausted(false)
      }
    } catch {
      setExhausted(true)
    }
  };

  const handleSelect = (value: any) => {
    ReactGA.event({
      category: "Search",
      action: `search ${value}`
    });

    navigate(`/repo/${value}`)
  };

  const options = data.map(d => <Select.Option key={d.title} value={d.title}>
    <div><b>{d.title}</b></div>
    <div className={styles.optionDescription}>{typeof d.description === "string" ? d.description : "No description"}</div>
  </Select.Option>);

  return <Row style={{ marginBottom: 50 }} gutter={20}>
    <Col xs={24} sm={24} md={24} lg={12} style={{ marginBottom: 20 }}>
      <h1 className={styles.title}>Kivach</h1>
      <p className={styles.subTitle}>Cascading donations to github repositories</p>
      <Form>
        <Form.Item extra={exhausted ? <span style={{ color: "red" }}>You have reached the limit of search queries, please try again in a couple of minutes</span> : ""}>
          <Select
            size="large"
            className={styles.select}
            filterOption={false}
            defaultActiveFirstOption={true}
            notFoundContent={null}
            showSearch
            placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Repo name, e.g. bitcoin/bitcoin"
            onSelect={handleSelect}
            onSearch={debounce(handleSearch, 800)}
            loading={true}
            suffixIcon={<SearchOutlined style={{ fontSize: 16 }} />}
          >
            {options}
          </Select>
        </Form.Item>
      </Form>
      <p className={styles.description}>Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.</p>
    </Col>
    <Col xs={24} sm={24} md={16} lg={12}>
      <HowIllustration />
    </Col>
  </Row>
})