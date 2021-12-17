import { Avatar, List } from "antd"
import { ForkOutlined, StarOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import { Fragment, memo } from "react"
import cn from "classnames";

import { truncate, getAvatarLink } from "utils";

import styles from "./Repository.module.css";

const FULL_NAME_MAX_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 24;
const COUNT_SHOWN_ON_PAGE = 9;

export interface IRepositoryItem {
  full_name: string;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  created_at?: string;
  isLink?: boolean;
}

const RepositoryItem: React.FC<IRepositoryItem> = ({ full_name, description, language, stargazers_count, forks_count, isLink = true, created_at }) => {
  const owner = full_name.split("/")?.[0]
  const avatarLink = getAvatarLink(owner);
  const Wrapper = isLink ? Link : Fragment;

  return <Wrapper to={isLink ? `/repo/${full_name}` : ""} className={cn({ [styles.itemWrapper]: isLink })}>
    <div className={cn(styles.item, { [styles.item_notLink]: !isLink }, { [styles.item_disable]: !created_at })}>
      <Avatar size={50} src={avatarLink} className={styles.avatar} />
      <div>
        <div className={styles.fullName}>{truncate(full_name, FULL_NAME_MAX_LENGTH)}</div>
        <div className={styles.description}>{description ? truncate(description, DESCRIPTION_MAX_LENGTH) : "No description"}</div>
        <div className={styles.metaWrap}>
          {language && <span className={styles.metaItem}>{language}</span>}
          <span className={styles.metaItem}><StarOutlined /> {stargazers_count}</span>
          <span><ForkOutlined /> {forks_count}</span></div>
      </div>
    </div>
  </Wrapper>
}

export interface IRepositoryList {
  data: IRepositoryItem[] | undefined;
  prefixForKeys: string;
  loading?: boolean;
}

const RepositoryList: React.FC<IRepositoryList> = memo(({ data, prefixForKeys, ...rest }) => {
  return <List
    dataSource={data || []}
    grid={{
      column: 3,
      gutter: 0,
      xs: 1,
      sm: 2,
      md: 2,
      lg: 3
    }}
    locale={{ emptyText: "No repositories" }}
    rowKey={(repository => `${prefixForKeys} - ${repository.full_name}`)}
    renderItem={repository => <RepositoryItem {...repository} />}
    pagination={{ defaultPageSize: COUNT_SHOWN_ON_PAGE, hideOnSinglePage: true }}
    size="large"
    {...rest}
  />
})

export {
  RepositoryList,
  RepositoryItem
}