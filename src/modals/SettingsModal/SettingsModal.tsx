import { CheckCircleOutlined, CopyOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Modal, Tabs, Image, Col, Row, Form, Input, Button, message } from "antd";
import { useState, memo } from "react";
import { Helmet } from 'react-helmet-async';
import { CopyToClipboard } from "react-copy-to-clipboard";

import { ChangeRules } from "components/ChangeRules/ChangeRules";
import { Distribute } from "components/Distribute/Distribute";
import { getAvatarLink, generateBannerCode } from "utils";
import config from 'config';

interface ISettingsModal {
  fullName: string;
}

const { TabPane } = Tabs;

export const SettingsModal: React.FC<ISettingsModal> = memo(({ fullName, children }) => {
  const [visible, setVisible] = useState(false);
  const [owner] = fullName.split("/");

  // handles 
  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  const avatarUrl = getAvatarLink(owner);

  const bannerCode = fullName && generateBannerCode(fullName);

  return <>
    <span onClick={handleOpen}>{children || <SettingOutlined style={{ fontSize: 20, cursor: "pointer" }} />}</span>
    <Modal
      visible={visible}
      title={null}
      footer={null}
      onOk={handleOpen}
      width={700}
      destroyOnClose={true}
      onCancel={handleClose}>
      <Helmet>
        <title>Kivach - {fullName} management</title>
      </Helmet>

      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
        <Avatar src={avatarUrl} size={40} style={{ marginRight: 20 }} />  {fullName} management
      </div>

      <Tabs size="large">
        <TabPane tab="Distribute now" key="1">
          <Distribute fullName={fullName} />
        </TabPane>
        <TabPane tab="Distribution rules" key="2">
          <ChangeRules fullName={fullName} />
        </TabPane>
        <TabPane tab="Donation button" key="3">
          <p>
            To request donations and display a fully setup checkmark <CheckCircleOutlined style={{ color: "#0037ff" }} /> next to your repo, please add this code to your README.md:
          </p>
          <Row gutter={30}>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 12 }} style={{ marginBottom: 30 }}>
              <Form>
                <Form.Item>
                  <Input.TextArea value={bannerCode} />
                </Form.Item>


                {bannerCode && <Form.Item>
                  <CopyToClipboard text={bannerCode} onCopy={() => message.success("The banner code has been copied to the clipboard")}>
                    <Button size="small" type="dashed" block><CopyOutlined /> Copy</Button>
                  </CopyToClipboard>
                </Form.Item>}
              </Form>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} lg={{ span: 12 }}>
              <Image src={`${config.backend_url}/banner?repo=${fullName}`} preview={false} alt="Cascading donation" />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </Modal>
  </>
})