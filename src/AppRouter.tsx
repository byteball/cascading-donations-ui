import { MainLayout } from "components/MainLayout/MainLayout";
import { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { AppDispatch } from "store";
import { getTokensThunk } from './store/thunks/getTokens';
import { getIconList } from "store/thunks/getIconList";
import { MainPage, RepositoryPage, AddPage, FaqPage, MyReposPage } from "pages";
import { clearAllCache } from "store/actions/clearAllCache";

export const AppRouter: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(getTokensThunk());
    dispatch(getIconList());
    dispatch(clearAllCache());
  }, []);

  return <BrowserRouter>
    <MainLayout>
      <Routes>
        <Route path="/repo/:owner/:name" element={<RepositoryPage />} />
        <Route index element={<MainPage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/my" element={<MyReposPage />} />
      </Routes>
    </MainLayout>
  </BrowserRouter>
}