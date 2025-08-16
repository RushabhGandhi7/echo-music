import { supabase } from "../../lib/supabaseClient";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.file[0];
    const fileData = fs.readFileSync(file.filepath);
    const fileName = `${Date.now()}-${file.originalFilename}`;

    const { data, error } = await supabase.storage
      .from("music")
      .upload(fileName, fileData, { contentType: "audio/mpeg" });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicUrl } = supabase.storage.from("music").getPublicUrl(fileName);

    await supabase.from("songs").insert([
      { title: fields.title[0], artist: fields.artist[0], file_url: publicUrl.publicUrl },
    ]);

    return res.status(200).json({ message: "Upload success", url: publicUrl.publicUrl });
  });
}
