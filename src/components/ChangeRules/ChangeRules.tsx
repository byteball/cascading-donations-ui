import { useState, useEffect, memo } from "react"
import { Spin, Form, Input, Button, Select, Alert } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { debounce, isArray, isNumber } from "lodash";
import QRButton from "obyte-qr-button";
import { useSelector } from "react-redux";

import { IRules, Agent } from "api/agent";
import Github, { ISearchResultItem } from "api/github";
import config from "config";
import { selectWalletAddress } from "store/slices/settingsSlice";
import { generateLink } from "utils";

interface IChangeRules {
  rules?: IRules;
  fullName: string;
}

type IValues = Array<IValue | undefined>

interface IValue {
  repo?: string;
  percent?: number | string;
}

export const ChangeRules: React.FC<IChangeRules> = memo(({ rules: actualRules, fullName }) => {
  const [initialRules, setInitialRules] = useState<IRules>();
  const [values, setValues] = useState<IValues>([]);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<ISearchResultItem[]>([]);
  const walletAddress = useSelector(selectWalletAddress);

  const updateRules = () => {
    Agent.getRules(fullName).then(([rules]) => setInitialRules(rules))
  };

  useEffect(() => {
    if (!actualRules) {
      updateRules()
    } else {
      setInitialRules(actualRules)
    }
  }, [fullName]);

  if (!initialRules || Object.keys(initialRules).length === 0) return <div style={{ display: "flex", justifyContent: "center" }}><Spin size="large" /></div>

  const options = data.map(d => <Select.Option key={d.title} value={d.title} disabled={d.title === fullName}>
    <div>{d.title}</div>
    <small style={{ color: "#7f8c8d" }}>{typeof d.description === "string" ? d.description : "No description"}</small>
  </Select.Option>);

  const initialRulesWithoutOwner = Object.entries(initialRules).filter(([repo]) => repo !== fullName).map(([repo, percent]) => ({ repo, percent }));

  const percentSum = (values.length === 0 ? initialRulesWithoutOwner : values).reduce((last, current: any) => {
    return Number(last) + ((current?.percent && isNumber(Number(current?.percent))) ? Number(current?.percent) : 0);
  }, 0)

  const ownerPercent = values.length === 0 ? initialRules[fullName] || 0 : percentSum >= 100 ? 0 : 100 - (percentSum || 0);

  const handleSearch = async (value: any) => {
    if (value && value.includes("/")) {
      const [owner, name] = value.split("/");
      const result = await Github.getReposListByUser(owner);
      setData(name ? result.filter((repo) => repo.title.includes(value)) : result);
    } else {
      setData([]);
    }
  };

  const resultRules: IRules = {};

  if (values.length === 0) {
    if (initialRulesWithoutOwner.length > 0) {
      initialRulesWithoutOwner.forEach(({ repo, percent }) => resultRules[repo] = percent)
    }
  } else {
    values.forEach((rule) => {
      if (rule && rule.percent && rule.repo) {
        resultRules[rule.repo] = Number(rule.percent);
      }
    })
  }

  const link = generateLink({ amount: 1e4, aa: config.aa_address, data: { set_rules: 1, repo: fullName, rules: resultRules }, from_address: walletAddress });

  return <div>
    <p>
      All the funds donated to your repo will be distributed between you and other repos you want to support. <br />
      Please add <b>up to 10 other repos</b> you want to support and the percentages of the donated funds that will be forwarded to them.
    </p>
    <Form validateTrigger={["onChange"]} size="large" preserve={false} onInvalid={() => setIsError(false)} autoComplete="off" onValuesChange={(_, values) => values.rules && setValues(values.rules)} onFieldsChange={(_, allFields) => {
      if (allFields.find(field => field.errors?.length || (field.name && typeof field.name === "object" && field.name.length === 1 && isArray(field.value) && field.value.findIndex((v) => !v?.repo || !v?.percent || !v) >= 0))) {
        setIsError(true)
      } else {
        setIsError(false)
      }
    }}>
      <Form.Item>
        <Input placeholder="Repository" value={fullName} disabled={true} style={{ width: "55%", display: 'inline-block', marginRight: 8 }} />
        <Input placeholder="percent" value={+ownerPercent.toFixed(6)} disabled={true} style={{ width: "calc(45% - 58px)", display: 'inline-block' }} />
      </Form.Item>
      <Form.List name="rules" initialValue={initialRulesWithoutOwner}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <Form.Item key={key + 1} style={{ display: 'flex', marginBottom: 8, width: "100%", alignItems: "center" }}>
                <Form.Item
                  {...restField}
                  name={[name, 'repo']}
                  fieldKey={[fieldKey + 1, 'repo']}
                  style={{ width: "55%", marginRight: 8, display: "inline-block" }}
                  rules={[
                    { required: true, message: 'Missing Repository' },
                    {
                      validator: async (_, n) => {
                        if (n) {
                          if (n.split("/").length !== 2) {
                            return Promise.reject(new Error('Not valid repo'));
                          } else if (values.filter((f: any) => f && (f.repo === n)).length >= 2 || fullName === n) {
                            return Promise.reject(new Error('Repo already exist'));
                          } else {
                            const [owner, name] = n.split("/");
                            if (!owner || owner.length === 0 || !name || name.length === 0) {
                              return Promise.reject(new Error('Not valid repo'));
                            }
                          }
                        }

                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Select
                    size="large"
                    showArrow={false}
                    filterOption={false}
                    defaultActiveFirstOption={false}
                    showSearch
                    placeholder="Select repository"
                    onSearch={debounce(handleSearch, 300)}
                    // @ts-ignore
                    notFoundContent={<span>The search will start after entering the owner/</span>}
                    onSelect={() => {
                      setData([])
                    }}
                  >
                    {options}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  style={{ width: "calc(45% - 58px)", marginRight: 8, display: "inline-block" }}
                  name={[name, 'percent']}
                  fieldKey={[fieldKey + 1, 'percent']}
                  rules={[{ required: true, message: 'Missing percent' }, { type: "number", min: 0.00001, max: 100, transform: (value) => Number(value), message: "Not valid percent" }]}
                >
                  <Input placeholder="Percent" />
                </Form.Item>
                <Form.Item style={{ display: "inline-block" }}>
                  <MinusCircleOutlined style={{ fontSize: "22px" }} onClick={() => remove(name)} />
                </Form.Item>
              </Form.Item>
            ))}
            <Form.Item>
              <Button type="dashed" style={{ width: "calc(100% - 50px)" }} onClick={() => add()} block icon={<PlusOutlined />}>
                Add recipient
              </Button>
            </Form.Item>
          </>)}
      </Form.List>
      <Form.Item>
        {percentSum > 100 && <Form.Item>
          <Alert type="error" message="The maximum cumulative percentage must not exceed 100" />
        </Form.Item>}
        <QRButton type="primary" href={link} disabled={isError || (values.length !== 0 && percentSum > 100)}>
          Save rules
        </QRButton>
      </Form.Item>
    </Form>
  </div>
})