import UploadForm from "@/components/UploadForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 text-center">
          {" "}
          Docufi - <b> Minichat </b>
        </h1>
        <UploadForm />
      </main>
    </div>
  );
}
