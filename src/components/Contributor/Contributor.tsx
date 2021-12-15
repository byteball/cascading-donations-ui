import { Avatar, List } from "antd";
import { memo } from "react";

import { getAvatarLink, truncate } from "utils";
import { IContributor } from 'store/slices/cacheSlice';

import styles from "./Contributor.module.css";

const LOGIN_MAX_LENGTH = 15;
const COUNT_SHOW_ON_PAGE = 10;

const ContributorItem: React.FC<IContributor> = ({ login, contributions }) => {
  const avatarLink = getAvatarLink(login || "t3afak4se43aafa"); // or a not exist user
  return <div className={styles.itemWrap}>
    <Avatar src={avatarLink} size={30} className={styles.avatar} />
    <div>
      {login ? <a href={`https://github.com/${login}`} target="_blank" rel="noopener">{truncate(login, LOGIN_MAX_LENGTH)}</a> : "Github user"}
      <div><b>{contributions}</b> contributions</div>
    </div>
  </div>
}

export interface IContributorList {
  data: IContributor[] | undefined;
  prefixForKeys: string;
  loading?: boolean;
}

const ContributorList: React.FC<IContributorList> = memo(({ data, prefixForKeys, ...rest }) => {
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
    locale={{ emptyText: "No repositories" }}
    rowKey={(contributor => `${prefixForKeys} - ${contributor.login} - ${contributor.contributions}`)}
    renderItem={contributor => <ContributorItem {...contributor} />}
    pagination={{ defaultPageSize: COUNT_SHOW_ON_PAGE, hideOnSinglePage: true }}
    size="large"
    {...rest}
  />
})

export {
  ContributorList,
  ContributorItem
}