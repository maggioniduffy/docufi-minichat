import UploadForm from "@/components/UploadForm";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
        Docufi - <b>Minichat</b>
      </h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl h-full">
        {/* Upload Form */}
        <div className="md:w-1/3 w-full">
          <UploadForm />
        </div>
        {/* Chat Section */}
        <Chat />
      </div>
    </div>
  );
}
