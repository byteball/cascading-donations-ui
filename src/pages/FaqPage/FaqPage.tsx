import { Collapse, Typography } from "antd"
import { Helmet } from 'react-helmet-async';
import { Link } from "react-router-dom";

const { Panel } = Collapse;

export const FaqPage: React.FC = () => (
  <div>
    <Helmet>
      <title>Kivach - F.A.Q.</title>
    </Helmet>
    <Typography.Title>F.A.Q.</Typography.Title>
    <Collapse ghost accordion>
      <Panel header="What coins are accepted for donations?" key="10">
        <p>All Obyte tokens and tokens on other chains (Ehereum, BSC, Polygon) that are exportable to Obyte through <a href="https://counterstake.org" target="_blank" rel="noopener">Counterstake Bridge</a>. This includes many popular tokens such as USDC, ETH, WBTC, BNB, etc.</p>
      </Panel>
      <Panel header="Can I donate with a creadit card?" key="20">
        <p>Not directly but you can buy any of the supported crypto tokens with credit card through any of the existing fiat on-ramps and then donate those crypto tokens.</p>
      </Panel>
      <Panel header="Can I donate to any github repo even if their owner didn't set up anything on Kivach?" key="30">
        <p>Yes, you can donate to any of the 28 million public repositories on github. Your money will wait for the owner to prove ownership of their github account and claim the money (and optionally share it with other repos). The money will be stored on an <a href="https://obyte.org/platform/autonomous-agents" target="_blank" rel="noopener">Autonomous Agent</a> that underpins the whole cascading donations system, and nobody else will be able to take the money.</p>
      </Panel>
      <Panel header="I'm a developer and noticed that some people have already donated to one of my repos. How do I claim the funds?" key="40">
        <p>Use the <Link to="/add">Add repository</Link> link. You'll need to install <a href="https://obyte.org" target="_blank" rel="noopener">Obyte wallet</a> if you don't already have one and do github attestation (find the Github Attestation bot in the Bot Store in the wallet) to link your github account. Then, you set up the distribution rules and trigger the first distribution to claim the funds.</p>
      </Panel>
      <Panel header="I'm a developer and looking to receive donations. Are there any requirements as to what share of donations should be forwarded and to what repos?" key="50">
        <p>There are no requirements, it's totally up to you. You can keep 100% of donations for yourself if you like, or, the other extreme, you can choose to forward 100% to other repos and leave nothing for yourself. We recommend forwarding some share of donations to other open-source projects that are critical for your project and made it possible. The donors will see your distribution rules and we expect that they will be more willing to donate when they see that they can help more than one project and you are also a donor (in a way).</p>
      </Panel>
      <Panel header="Are Kivach donations tax deductible?" key="60">
        <p>You'd better consult a tax lawyer in your jurisdiction but to the best of our knowledge, they are not. Normally, tax exempt status is granted to certain entities that are registered and supervised by the respective government bodies. Kivach, on the other hand, exists in a decentralized space and can't enjoy such a status. This means that any donations you make on Kivach, you make them out of your (or your company's) <i>net</i> income and can't use them to reduce your taxes.</p>
      </Panel>
      <Panel header="Why github only?" key="70">
        <p>It's quite common in open-source software that one project heavily depends on a few other open-source projects, which in turn depend on yet other open-source projects, and so on. This makes it natural to want to reward all layers of development that contributed to the final user-facing app, and Kivach makes this possible by automatically cascading donations down the technical stack.</p>
        <p>That said, the same concept can of course be used in any other industries where the recipients of donations feel a need to share with other contributors who made their work possible. Kivach itself is <a href="https://github.com/byteball/cascading-donations-ui" target="_blank" rel="noopener">open-source</a> and one can fork it to help creators in any other fields to be rewarded.</p>
      </Panel>
      <Panel header="Why the name Kivach?" key="80">
        <p>The cascading donations service is named so after a <a href="https://en.wikipedia.org/wiki/Kivach_Falls" target="_blank" rel="noopener">cascading waterfall in Karelia</a>.</p>
      </Panel>
    </Collapse>
    <div style={{ marginTop: 20 }}>Other questions? Ask on <a href="https://discord.obyte.org" target="_blank" rel="noopener">Obyte discord</a>.</div>
  </div>
)