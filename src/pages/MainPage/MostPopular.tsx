import { Typography } from "antd";
import { useEffect, useCallback, useState, memo } from "react";

import { backendAPI } from "api/backend";
import { IRepositoryItem, RepositoryList } from "components/Repository/Repository";

export const MostPopular: React.FC = memo(() => {
  const [data, setData] = useState<IRepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getPopular = useCallback(async () => {
    setLoading(true)
    const data = await backendAPI.getPopular();
    setLoading(false)
    setData(data);
  }, []);

  useEffect(() => {
    getPopular();
  }, [getPopular])

  return <div style={{ marginBottom: 20 }}>
    <Typography.Title level={2}>Most popular</Typography.Title>
    <RepositoryList
      data={data}
      loading={loading}
      prefixForKeys="popular"
    />
  </div>
})