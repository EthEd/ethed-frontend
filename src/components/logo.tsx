import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logos/eipsinsight-logo.png" alt="EIPSInsight" height={32} width={128} className="h-8 mx-auto"/>
      <span className="hidden sm:inline font-semibold">EIPSInsight</span>
    </div>
  );
}
