import { Collapse, Typography } from "antd"
import { Helmet } from 'react-helmet-async';

const { Panel } = Collapse;

export const FaqPage: React.FC = () => (
  <div>
    <Helmet>
      <title>Kivach - F.A.Q</title>
    </Helmet>
    <Typography.Title>F.A.Q</Typography.Title>
    <Collapse ghost accordion>
      <Panel header="Lorem ipsum, dolor sit amet consectetur adipisicing elit 1?" key="1">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, placeat! Neque ullam quod exercitationem consequuntur, quibusdam, perspiciatis illum temporibus hic voluptatum doloremque dignissimos dolorem, sit assumenda deserunt ratione nulla minima!</p>
      </Panel>
      <Panel header="Lorem ipsum, dolor sit adipisicing elit 2?" key="2">
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsa beatae excepturi nemo impedit. Incidunt atque odio vel omnis blanditiis voluptates, veritatis eum sequi officia sapiente doloribus dignissimos suscipit itaque qui.</p>
      </Panel>
      <Panel header="Lorem ipsum, dolor sit amet consectetur dolor sit amet consectetur adipisicing elit 1?" key="3">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, placeat! Neque ullam quod exercitationem consequuntur, quibusdam, perspiciatis illum temporibus hic voluptatum doloremque dignissimos dolorem, sit assumenda deserunt ratione nulla minima!</p>
      </Panel>
      <Panel header="Lorem ipsum, dolor sit adipisicing elit 2?" key="4">
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsa beatae excepturi nemo impedit. Incidunt atque odio vel omnis blanditiis voluptates, veritatis eum sequi officia sapiente doloribus dignissimos suscipit itaque qui.</p>
      </Panel>
    </Collapse>
    <div style={{ marginTop: 20 }}>Other questions? Ask on <a href="#">discord</a></div>
  </div>
)