import UploadForm from "@/components/UploadForm";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-20">
      <h1 className="text-3xl sm:text-4xl font-medium text-cyan-800 mb-8 text-center">
        Docufi - <b>Minichat</b>
      </h1>
      <Chat />
    </div>
  );
}
