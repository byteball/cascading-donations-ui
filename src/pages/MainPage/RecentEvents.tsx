import { Typography } from "antd";
import { useSelector } from 'react-redux';

import { EventList } from "components/Event/Event"
import { selectEvents } from "store/slices/responsesSlice";
import { IEvent } from 'utils/responseToEvent';

export const RecentEvents: React.FC = () => {
  const recentEvents = useSelector(selectEvents);
  if (!recentEvents.length) return null;
  
  return <div>
    <Typography.Title level={2}>Recent events</Typography.Title>
    <EventList data={recentEvents.filter((x): x is IEvent => x !== null)} />
  </div>
}