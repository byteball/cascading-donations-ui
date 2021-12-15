import { message } from "antd";
import config from "config";
import obyte from "obyte";
import { store } from "store";

import { addResponse } from "store/slices/responsesSlice";
import { getAaResponses } from "store/thunks/getAaResponses";

export const client = new obyte.Client(
  `wss://byteball.org/bb${true ? "-test" : ""}`,
  {
    testnet: true,
    reconnect: true,
  }
);

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
    const author = unit?.authors?.[0]?.address;

    if (subject === "light/aa_request") {
      const state = store.getState();
      if (state.settings.walletAddress === author) {
        message.success("We have received your request. The interface will update after the transaction stabilizes");
      }
    } else if (subject === "light/aa_response" && aa_address === config.aa_address) {
      store.dispatch(addResponse(body));
    }
  });

  // @ts-ignore
  client.client.ws.addEventListener("close", () => {
    // store.dispatch(closeConnection());
    clearInterval(heartbeat);
  });
})