import Image from "next/image";

export default function Conversations() {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 bg-background">
      <div className="flex flex-1 items-center justify-center gap-2">
        <Image alt="Logo" height={40} width={40} src="/logo.webp" />
        <p className="font-semibold text-xl">Resound</p>
      </div>
    </div>
  );
}
