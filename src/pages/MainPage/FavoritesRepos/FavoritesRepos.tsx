import { Typography } from "antd";
import { useEffect, useCallback, useState, memo } from "react";
import { useSelector } from "react-redux";

import { IRepositoryItem, RepositoryList } from "components/Repository/Repository";
import { selectFavorites } from "store/slices/settingsSlice";
import github from "api/github";


export const FavoritesRepos: React.FC = memo(() => {
  const [data, setData] = useState<IRepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const favorites = useSelector(selectFavorites);

  const getFavorites = useCallback(async () => {
    if (favorites.length > 0){
      setLoading(true)
      const dataGetters = favorites.map(favorite => github.getBasicInformation(favorite))
      const data = await Promise.all(dataGetters);
      setLoading(false)
      setData(data);
    }
  }, []);

  useEffect(() => {
    getFavorites();
  }, [getFavorites, favorites])

  if (favorites.length === 0) return null
  return <div style={{ marginBottom: 20 }}>
    <Typography.Title level={2}>Favorites</Typography.Title>
    <RepositoryList
      data={data}
      loading={loading}
      prefixForKeys="popular"
    />
  </div>
})