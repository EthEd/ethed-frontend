export function ipfsToGatewayUrl(uri: string, gatewayBase = "https://gateway.pinata.cloud"): string {
  if (!uri) return uri;

  if (uri.startsWith("ipfs://")) {
    const cidAndPath = uri.replace(/^ipfs:\/\//, "");
    return `${gatewayBase.replace(/\/$/, "")}/ipfs/${cidAndPath}`;
  }

  return uri;
}
