import { Typography, Button, Form, Modal, Select, Radio } from "antd";
import { useState, memo } from 'react';
import { useSelector } from 'react-redux';
import { selectObyteTokens } from "store/slices/tokensSlice";
import { useDispatch } from 'react-redux';

import { changeFilters, selectFilters } from "store/slices/settingsSlice";


export const RepositoryFiltersModal: React.FC = memo(() => {
  const [visible, setVisible] = useState<boolean>(false);

  const tokens = useSelector(selectObyteTokens);
  const filters = useSelector(selectFilters);

  const dispatch = useDispatch();
  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  return <>
    <Button onClick={handleOpen}>Edit filters</Button>
    <Modal
      visible={visible}
      title={null}
      footer={null}
      onOk={handleOpen}
      width={600}
      destroyOnClose={true}
      onCancel={handleClose}>
      <Form>
        <Typography.Title level={2}>Filters</Typography.Title>
        <Form.Item colon={false} label="Are the rules set?">
          <Radio.Group value={filters.areSetRules} size="middle" defaultValue={null} buttonStyle="solid" onChange={(ev) => dispatch(changeFilters({ type: "areSetRules", value: ev.target.value }))}>
            <Radio.Button value={true}>YES</Radio.Button>
            <Radio.Button value={false}>NO</Radio.Button>
            <Radio.Button value="all">ALL</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item colon={false} label="Any donations?">
          <Radio.Group value={filters.haveDonations} size="middle" defaultValue={null} buttonStyle="solid" onChange={(ev) => dispatch(changeFilters({ type: "haveDonations", value: ev.target.value }))}>
            <Radio.Button value={true}>YES</Radio.Button>
            <Radio.Button value={false}>NO</Radio.Button>
            <Radio.Button value="all">ALL</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Donation Tokens">
          <Select value={filters.tokens !== undefined ? filters.tokens : []} size="middle" placeholder="Select tokens" mode="multiple" optionFilterProp="children" loading={!tokens || Object.keys(tokens).length === 0} onChange={(value: string[]) => dispatch(changeFilters({ type: "tokens", value }))}>
            {tokens && Object.entries(tokens).map(([asset, { symbol }]) => <Select.Option key={asset} value={asset}>{symbol}</Select.Option>)}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  </>
})