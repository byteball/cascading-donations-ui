
import { Avatar, Button, List } from "antd";
import { memo, useState } from "react";

import { getAvatarLink } from "utils";
import { IEvent } from "utils/responseToEvent";

import styles from "./Event.module.css";

const STEP_LOAD_MORE = 4;
const INIT_COUNT_ON_PAGE = 4;

const EventItem: React.FC<IEvent> = ({ message, time, repository, link }) => {
  const avatarLink = getAvatarLink(repository.split("/")?.[0])
  return <div className={styles.itemWrap}>
    <Avatar src={avatarLink} className={styles.avatar} />
    <div>
      <div><small><a className={styles.timeLink} target="_blank" rel="noopener" href={link}>{time}</a></small></div>
      <div>{message}</div>
    </div>
  </div>
}

export interface IEventList {
  data: Array<IEvent>;
  filters?: {
    repository?: string;
  };
}

const EventList: React.FC<IEventList> = memo(({ data, filters }) => {
  const [limit, setLimit] = useState(INIT_COUNT_ON_PAGE);
  const sortedData = filters?.repository ? data.filter((event) => event.repository === filters.repository) : data;
  const limitedData = sortedData.slice(0, limit);
  return <List locale={{ emptyText: "No events" }} dataSource={limitedData} loadMore={sortedData.length > limit ? <Button type="text" onClick={() => setLimit((l) => l + STEP_LOAD_MORE)} size="middle">Show more</Button> : null} renderItem={(props: IEvent) => <EventItem {...props} />} />
})

export {
  EventList,
  EventItem
}