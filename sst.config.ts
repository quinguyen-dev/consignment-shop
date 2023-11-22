import { SSTConfig } from "sst";
import { API } from "./AWS/stacks/ConsignmentAWSStack";

export default {
  config(_input) {
    return {
      name: "consignment-shop",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app.stack(API);
  }
} satisfies SSTConfig;
