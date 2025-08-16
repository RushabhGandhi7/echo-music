import { useState } from "react";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message || "Uploaded!");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload Song</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Artist" onChange={(e) => setArtist(e.target.value)} />
        <input type="file" accept="audio/mp3" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" className="bg-sky-500 text-white p-2 rounded">Upload</button>
      </form>
    </div>
  );
}
