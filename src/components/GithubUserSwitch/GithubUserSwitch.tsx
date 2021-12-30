import { Avatar, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";

import { changeActiveGithubUser, selectGithubUsers, selectWalletAddress } from "store/slices/settingsSlice";
import { selectActiveGithubUser } from 'store/slices/settingsSlice';

import styles from "./GithubUserSwitch.module.css";

const { Option } = Select;

export const GithubUserSwitch = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const githubUsers = useSelector(selectGithubUsers);
  const activeGithubUser = useSelector(selectActiveGithubUser)

  const dispatch = useDispatch();

  return <div>
    <div className={styles.wrap}>
      <Avatar className={styles.avatar} size={40} src={`https://avatars.githubusercontent.com/${activeGithubUser}`} alt={activeGithubUser || "Github avatar"} />
      <div className={styles.info}>
        <Select size="small" defaultValue={activeGithubUser || undefined} bordered={false} onChange={(user) => dispatch(changeActiveGithubUser(user))} style={{ width: "auto", fontSize: 16 }} dropdownStyle={{ minWidth: 150 }}>
          {githubUsers.map((user) => <Option key={user} style={{ minWidth: "100%" }} value={user}>{user}</Option>)}
        </Select>
        <div className={styles.wallet}>{walletAddress}</div>
      </div>
    </div>
  </div>
}