import { BackTop, Button, Drawer, Layout } from "antd";
import { NavLink } from "react-router-dom";
import { useInterval, useWindowSize } from "usehooks-ts";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import { MainMenu } from "components/MainMenu/MainMenu";
import { getGithubUser } from "store/thunks/getGithubUser";
import { selectWalletAddress } from "store/slices/settingsSlice";

import styles from "./MainLayout.module.css";

const { Header, Content, Footer } = Layout;

export const MainLayout: React.FC = ({ children }) => {
  const { width } = useWindowSize();
  const { pathname } = useLocation();
  const [activeMenu, setActiveMenu] = useState(false);
  const dispatch = useDispatch();
  const walletAddress = useSelector(selectWalletAddress);

  useEffect(() => {
    dispatch(getGithubUser());
  }, [walletAddress]);

  useInterval(() => dispatch(getGithubUser()), 5 * 1000 * 60)

  return (
    <Layout className={styles.layout}>
      <BackTop />
      <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <NavLink to="/" className={styles.navLink}>
          <img className={styles.logo} src="/logo-inverse.svg" alt="Kivach" />

          <div className={styles.brand}>
            <div>
              <span>Kivach</span>
            </div>
            <div>
              <small>Cascading donations</small>
            </div>
          </div>
        </NavLink>
        {width >= 990 ? (
          <MainMenu pathname={pathname} width={width} mode="horizontal" />
        ) : (
          <div className={styles.drawerWrap}>
            <Drawer
              title={<NavLink to="/" style={{ color: "#fff" }}>KIVACH</NavLink>}
              placement="left"
              closable={true}
              closeIcon={<CloseOutlined style={{ color: "#fff" }} />}
              onClose={() => setActiveMenu(false)}
              width={250}
              visible={activeMenu}
              bodyStyle={{ padding: 0, overflowX: "hidden", background: "#000", paddingTop: 10 }}
              headerStyle={{ background: "#000", color: "#fff", }}
              drawerStyle={{ color: "#fff" }}
            >
              <MainMenu
                pathname={pathname}
                width={width}
                onClose={() => setActiveMenu(false)}
                mode="vertical"
              />
            </Drawer>

            <Button onClick={() => setActiveMenu(true)} type="text" size="large" style={{ color: "#fff" }} icon={<MenuOutlined />} />
          </div>
        )}
      </Header>
      <Content className={styles.content}>
        <div className="container">
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 300, fontSize: 12 }}>All information about repositories belongs to their owners</div>
        &copy; Obyte
      </Footer>
    </Layout>
  )
}
