import { env } from "@/env";
import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@arcjet/next";

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
};

export default arcjet({
  key : env.ARCJET_KEY || "test-key",
  characteristics: ["fingerprint"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});