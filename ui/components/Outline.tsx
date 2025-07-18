import React, { useState } from 'react'

interface Props {
  docId?: string;
}   

const Outline = ({ docId }:Props) => {
    const [outline, setOutline] = useState<string | null>(null);
    const [topic, setTopic] = useState<string>("");

    const generateOutline = async (e: any, docId: string, topic: string) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/outline", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ docId, topic }),
            });

            if (!res.ok) {
                console.error("Error generating outline:", res.statusText);
                setOutline("Error generating outline.");
                return;
            }

            const { outline } = await res.json();
            setOutline(outline);
        } catch (error) {
            console.error("Error in outline generation:", error);
            setOutline("Error generating outline.");
        }
    }

    if (!docId) {
        return <div className="text-gray-500">Please select a document to generate an outline.</div>;
    }

    return (
        <div className='text-black'>
            {outline && (
                <div className="bg-gray-100 p-4 rounded-lg shadow-md h-56 overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words text-sm">{outline}</pre>
            </div>
            )}
            <form onSubmit={(e) => generateOutline(e, docId, topic)} className="mt-4">
                
                <input
                    type="text"
                    placeholder="Enter topic for outline"
                    className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
                    onChange={(e) => setTopic(e.target.value)}
                />
                <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={(e) => generateOutline(e,docId, topic)}
                >
                    Generate Outline
                </button>
            </form>
    </div>
  )
}

export default Outline