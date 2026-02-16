/**
 * Convert an IPFS URI (ipfs://...) to an HTTP gateway URL.
 *
 * Prefer the Pinata gateway if configured, otherwise fall back to the provided base.
 */
export function ipfsToGatewayUrl(
  uri: string,
  gatewayBase = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud"
): string {
  if (!uri) return uri;

  if (uri.startsWith("ipfs://")) {
    const cidAndPath = uri.replace(/^ipfs:\/\//, "");
    return `${gatewayBase.replace(/\/$/, "")}/ipfs/${cidAndPath}`;
  }

  return uri;
}
