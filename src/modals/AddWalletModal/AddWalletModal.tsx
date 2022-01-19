import { Button, Form, Input, Modal } from "antd"
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import obyte from "obyte";
import { Helmet } from 'react-helmet-async';

import { changeWallet, selectWalletAddress } from "store/slices/settingsSlice";
import { truncate } from "utils";

interface IWalletAddress {
  value: string;
  valid: boolean;
}

interface IAddWalletModal {
  triggerButtonIsPrimary?: boolean;
  triggerButtonIsLink?: boolean;
}

export const AddWalletModal: React.FC<IAddWalletModal> = ({ triggerButtonIsPrimary, triggerButtonIsLink, children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<IWalletAddress>({ value: "", valid: false });
  const dispatch = useDispatch();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<any>(null);

  const currentWalletAddress = useSelector(selectWalletAddress);

  const saveWallet = () => {
    if (walletAddress.value && walletAddress.valid) {
      dispatch(changeWallet(walletAddress.value));
      handleClose();
    }
  }

  useEffect(() => {
    if (currentWalletAddress) {
      setWalletAddress({
        value: currentWalletAddress,
        valid: true
      })
    }
  }, [currentWalletAddress, visible])

  // handles 
  const handleOpen = () => setVisible(true);

  const handleClose = () => setVisible(false);

  const handleWalletAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress({
      valid: obyte.utils.isValidAddress(ev.target.value),
      value: ev.target.value
    })
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && buttonRef.current) {
      buttonRef.current.click();
    }
  }

  return <>
    <Button onClick={handleOpen} style={triggerButtonIsLink ? { padding: 0, fontSize: "1em", display: "inline", height: "auto" } : {}} type={triggerButtonIsPrimary ? "primary" : (triggerButtonIsLink ? "link" : "default")}>{currentWalletAddress ? truncate(currentWalletAddress, 10) : (children || "ADD WALLET")}</Button>
    <Modal
      visible={visible}
      title={null}
      footer={null}
      onOk={handleOpen}
      destroyOnClose={true}
      width={600}
      onCancel={handleClose}
    >
      <Helmet>
        <title>Kivach - Add wallet</title>
      </Helmet>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
        {currentWalletAddress ? "Change" : "Add"} wallet address
      </div>
      {!currentWalletAddress && <p>You need it to set up your own repos and receive donations.</p>}
      <Form size="large">
        <Form.Item validateStatus={walletAddress.value === "" ? "" : (walletAddress.valid ? "success" : "error")}>
          <Input autoFocus={true} value={walletAddress.value} placeholder="Example: 2QVJOY3BRRGWP7IOYL64O5B..." onChange={handleWalletAddress} onKeyDown={handleEnter} ref={inputRef} />
        </Form.Item>
        <Button size="middle" type="primary" disabled={!walletAddress.valid || (currentWalletAddress ? currentWalletAddress === walletAddress.value : false)} onClick={saveWallet} ref={buttonRef}>{currentWalletAddress ? "Change" : "Add"} wallet</Button>
      </Form>
      <div style={{ marginTop: 10 }}>
        <small>
          <a href="https://obyte.org/#download" target="_blank" rel="noopener">Install Obyte wallet</a> if you don't have one yet, and copy/paste your address here.
        </small>
      </div>
    </Modal>
  </>
}