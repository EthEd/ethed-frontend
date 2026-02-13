import { env } from "@/env";
import { PinataSDK } from "pinata";

if (!env.PINATA_JWT && env.NODE_ENV === 'production') {
  // Startup-time warning so deploys notice missing Pinata config
  // (don't throw here so apps can still deploy in emergency, but surface the issue loudly)
  // eslint-disable-next-line no-console
  console.warn('WARNING: PINATA_JWT is not set — IPFS uploads will fail in production.');
}

export const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT,
  pinataGateway: env.PINATA_GATEWAY_URL,
});
