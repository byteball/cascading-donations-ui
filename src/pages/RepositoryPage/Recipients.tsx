import { useEffect, useState, memo, createRef } from "react";
import { useInterval, useWindowSize } from "usehooks-ts";
import { Pie } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';

import { Agent } from "api/agent";
import { IParsedRule, RecipientList } from "components/Recipient/Recipient";
import { getAvatarLink, truncate } from "utils";
import { Typography } from "antd";

interface IRecipients {
  fullName: string;
  rules: IParsedRule[]
}

const colors = ["#6295F9", "#F6C02D", "#a0d911", "#1890ff", "#2f54eb", "#722ed1", "#003a8c", "#8c8c8c", "#135200"];

export const Recipients: React.FC<IRecipients> = memo(({ fullName, rules }) => {
  const [recipients, setRecipients] = useState<IParsedRule[]>();

  const { width } = useWindowSize();
  const navigate = useNavigate();
  const chartRef = createRef();

  const updateRecipients = () => {
    Agent.getRules(fullName).then(([rules]) => setRecipients(Object.entries(rules).map(([repo, percent]) => ({ repo, percent }))));
  };

  useEffect(() => {
    if (rules) {
      setRecipients(rules);
    }
  }, [fullName]);

  useInterval(updateRecipients, 10 * 60 * 1000)

  const howMuchGetMaintainer = recipients ? recipients.find((rule) => rule.repo === fullName)?.percent || 0 : 0;

  let actual = 0;
  if (recipients) {
    const config = {
      appendPadding: width >= 830 ? 10 : 0,
      data: recipients.map((item: IParsedRule) => ({ ...item, color: "blue" })).sort((a, b)=> a.repo !== fullName ? b.percent - a.percent : 1000),
      angleField: 'percent',
      colorField: 'repo',
      pieStyle: (type: IParsedRule) => {
        if (type.repo !== fullName) {
          return ({
            cursor: "pointer",
            stroke: "#ddd",
            lineWidth: 1,
          })
        } else {
          return ({
            stroke: "#ddd",
            lineWidth: 1,
          })
        }
      },
      color: (type: IParsedRule) => {
        if (type.repo === fullName) {
          return "#ddd"
        } else {
          const color = colors[actual];
          actual++;
          return color;
        }
      },
      radius: width >= 830 ? 0.8 : 1,
      key: `pie-${fullName}`,
      renderer: "svg",
      label: {
        type: width >= 830 ? 'spider' : 'inner',
        content: width >= 830 ? `{name}
        {percentage}` : (item: any) => item.percent > 0.07 ? `${truncate(item.repo, 15)} 
        ${item.repo ? (item.percent * 100).toFixed(0) + "%" : ""}`: "",
        style: {
          fontSize: width >= 600 ? 12 : 10,
          textAlign: "center",
          fill: "#2D2C2C",
          background: "red",
        },
        autoRotate: false,
        labelHeight: 40
      },

      tooltip: {
        customContent: (_: any, items: any) => {
          return (
            <div key="tooltip">
              <ul style={{ paddingLeft: 0, fontSize: 14 }}>
                {items?.map((item: any, index: any) => {
                  const { name, value } = item;
                  const avatarUrl = getAvatarLink(name.split("/")?.[0])
                  return (
                    <li
                      key={`tooltip-${item.name}-${index}`}
                      className="g2-tooltip-list-item"
                      data-index={index}
                      style={{ padding: 3 }}
                    >
                      <span
                        style={{ lineHeight: 1.3 }}
                      >
                        <img src={avatarUrl} style={{ width: "1em", height: "1em", borderRadius: 5, marginRight: 5 }} alt={name} />
                        <span style={{ marginRight: 4 }}>{name}</span>
                        <span>receives {value}% of donations</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          );
        },
      },
      style: {
        userSelect: "none",
        stroke: "#000",
        width: width >= 830 ? 800 : width - 78,
        height: width > 600 ? "auto" : 300
      }
    }

    return <div>
      <div style={{ marginBottom: 20 }}>
        <Typography.Title level={4}>How the donated funds are distributed</Typography.Title>
        <div style={{ maxWidth: 700 }}>The maintainer(s) of <b>{fullName} receive {howMuchGetMaintainer}% </b> of the donated funds. The rest is automatically forwarded to other repos that the maintainer(s) want to support:</div>
      </div>
      {/* @ts-ignore */}
      <div style={{ width: width >= 830 ? 800 : width - 78, margin: "0 auto", marginBottom: 40 }}><Pie {...config} legend={false} ref={chartRef} onReady={(plot) => {
        plot.on('element:click', (...args: any) => {
          if (args[0].data?.data) {
            const repo = args[0].data?.data?.repo;
            if (repo) {
              if (fullName !== repo) {
                navigate(`/repo/${repo}`)
              }
            }
          }
        });
      }} />
      </div>

      {width < 830 && <RecipientList
        data={recipients}
        prefixForKeys={"recipients-" + fullName}
      />}
    </div>
  } else {
    return null
  }
})

export default Recipients;