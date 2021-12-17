import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { useSelector } from 'react-redux';

import { AddWalletModal } from "modals";
import { selectGithubUser } from 'store/slices/settingsSlice';

import styles from "./MainMenu.module.css";

interface IMainMenu {
  pathname: string;
  mode: "horizontal" | "vertical";
  width: number;
  onClose?: () => void
}

export const MainMenu: React.FC<IMainMenu> = ({ mode, pathname, onClose }) => {
  const githubUser = useSelector(selectGithubUser);

  return (
    <Menu
      mode={mode}
      theme="dark"
      overflowedIndicator={". . ."}
      style={{ border: "none", display: "flex", justifyContent: "flex-end", flexDirection: mode === "horizontal" ? "row" : "column", width: mode === "horizontal" ? 582 : undefined }}
      selectedKeys={pathname !== "/" ? [pathname] : []}
      onOpenChange={() => {
        onClose && onClose();
      }}
      selectable={false}
      onSelect={() => {
        onClose && onClose();
      }}
    >
      <Menu.Item key="/add">
        <NavLink
          to="/add"
          className={styles.link}
        >
          Add repository
        </NavLink>
      </Menu.Item>


      <Menu.Item key="/faq">
        <NavLink to="/faq"
          className={styles.link}
        >
          F.A.Q.
        </NavLink>
      </Menu.Item>
      
      {githubUser && <Menu.Item key="/my">
        <NavLink to="/my"
          className={styles.link}
        >
          My repositories
        </NavLink>
      </Menu.Item>}

      <Menu.Item key="/add_wallet">
        <AddWalletModal />
      </Menu.Item>
    </Menu>
  )
}