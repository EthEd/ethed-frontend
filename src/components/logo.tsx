import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logos/logo.png"
        alt="eth.ed"
        height={32}
        width={128}
        className="h-8 mx-auto"
        priority
      />
    </div>
  );
}
