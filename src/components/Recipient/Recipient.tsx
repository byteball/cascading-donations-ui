import { Avatar, List } from "antd";
import { Link } from "react-router-dom";
import { memo } from "react";

import { getAvatarLink, truncate } from "utils";

import styles from "./Recipient.module.css";

const LOGIN_MAX_LENGTH = 15;
const COUNT_SHOW_ON_PAGE = 10;

export interface IParsedRule {
  repo: string;
  percent: number;
}

const RecipientItem: React.FC<IParsedRule> = ({ repo, percent }) => {
  const [owner] = repo.split("/");

  const avatarLink = getAvatarLink(owner);

  return <div className={styles.itemWrap}>
    <Avatar src={avatarLink} size={30} className={styles.avatar} />
    <div>
      <Link to={`/repo/${repo}`}>{truncate(repo, LOGIN_MAX_LENGTH)}</Link>
      <div><b>{percent}</b>%  of donations</div>
    </div>
  </div>
}


interface IRecipientList {
  data: IParsedRule[];
  prefixForKeys: string;
}

const RecipientList: React.FC<IRecipientList> = memo(({ data, prefixForKeys }) => {
  return <List
    dataSource={data || []}
    grid={{
      column: 4,
      gutter: 0,
      xs: 1,
      sm: 2,
      md: 2,
      lg: 4
    }}
    locale={{ emptyText: "No recipients" }}
    rowKey={(recipient => `${prefixForKeys} - ${recipient.repo}`)}
    renderItem={recipient => <RecipientItem {...recipient} />}
    pagination={{ defaultPageSize: COUNT_SHOW_ON_PAGE, hideOnSinglePage: true }}
    size="large"
  />
})

export {
  RecipientItem,
  RecipientList
}