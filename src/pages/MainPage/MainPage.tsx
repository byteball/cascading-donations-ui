import { Helmet } from 'react-helmet-async';

import { FavoritesRepos } from "./FavoritesRepos/FavoritesRepos";
import { MainSearch } from "./MainSearch/MainSearch";
import { MostPopular } from "./MostPopular";
import { RecentEvents } from "./RecentEvents";

export const MainPage = () => {
  return <>
    <Helmet>
      <title>Kivach - cascading donations</title>
    </Helmet>
    
    <MainSearch />
    <FavoritesRepos />
    <MostPopular />
    <RecentEvents />
  </>
}