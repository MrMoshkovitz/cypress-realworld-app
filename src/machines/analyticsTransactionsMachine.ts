import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { isEmpty, omit } from "lodash/fp";

export const analyticsTransactionsMachine = dataMachine("analyticsTransactions").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.get(`http://localhost:3001/analytics`, {
        params: !isEmpty(payload) ? payload : undefined,
      });
      console.log("Resp Data")
      console.log(resp.data)
      return resp.data;
    },
  },
});
