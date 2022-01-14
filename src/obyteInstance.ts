import { message, notification } from "antd";
import config from "config";
import obyte from "obyte";
import { store } from "store";

import { addResponse } from "store/slices/responsesSlice";
import { getAaResponses } from "store/thunks/getAaResponses";

export const client = new obyte.Client(
  `wss://obyte.org/bb${config.testnet ? "-test" : ""}`,
  {
    testnet: config.testnet,
    reconnect: true,
  }
);

const getAAPayload = (messages: Array<any> = []) => messages.find(m => m.app === 'data')?.payload || {};

client.onConnect(() => {
  store.dispatch(getAaResponses());

  const heartbeat = setInterval(function () {
    client.api.heartbeat();
  }, 10 * 1000);

  client.justsaying("light/new_aa_to_watch", {
    aa: config.aa_address,
  });


  client.subscribe(async (_, result) => {
    const { subject, body, } = result[1];
    const { unit, aa_address } = body;
 
    const messages = unit?.messages;
    const payload = getAAPayload(messages);
    const author = payload?.donor || unit?.authors?.[0]?.address;

    if (subject === "light/aa_request") {
      const state = store.getState();
      if (state.settings.walletAddress === author) {
        message.success("Received your request. The interface will update after the transaction stabilizes.");
      } else if (payload && ("donate" in payload) && ("repo" in payload)) {
        notification.open({
          message: `${author.slice(0, 10)}... donated to ${payload.repo}`,
          type: "info"
        });
      }
    } else if (subject === "light/aa_response" && aa_address === config.aa_address) {
      store.dispatch(addResponse(body));
    }
  });

  // @ts-ignore
  client.client.ws.addEventListener("close", () => {
    clearInterval(heartbeat);
  });
})