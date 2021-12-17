import { Steps } from "antd";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { selectGithubUser, selectWalletAddress } from "store/slices/settingsSlice";
import { AttestationStep, WalletStep, LastStep } from "./steps";

const { Step } = Steps;

export const AddPage: React.FC = () => {
  let step;
  const walletAddress = useSelector(selectWalletAddress);
  const githubUser = useSelector(selectGithubUser);

  if (walletAddress) {
    if (githubUser) {
      step = 2;
    } else {
      step = 1;
    }
  } else {
    step = 0;
  }

  if (step === undefined) return null;

  let StepComponent;

  if (step === 0) {
    StepComponent = <WalletStep />
  } else if (step === 1) {
    StepComponent = <AttestationStep />
  } else {
    StepComponent = <LastStep />
  }

  const stepTitles = ["Wallet", "Attestation", "Configuration"];

  return <div>
    <Helmet>
      <title>Kivach - Add repository ({stepTitles[step]})</title>
    </Helmet>
    <Steps current={step} style={{ marginBottom: 30 }}>
      <Step title={stepTitles[0]} description="Adding your Obyte wallet" />
      <Step title={stepTitles[1]} description="Obtaining attestation of a github account" />
      <Step title={stepTitles[2]} description="Setting distribution rules and generating banner code" />
    </Steps>
    {StepComponent}
  </div>
}