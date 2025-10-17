import { client } from "@gradio/client";

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { image, filename } = req.body;

    // Terhubung ke Hugging Face Space
    const app = await client("RanggaArya/ViT-Compound-Expression");

    // Lakukan prediksi menggunakan library client
    const result = await app.predict("/predict_and_visualize", {
      input_img_pil: {
        data: image, // base64 string
        name: filename,
      },
    });

    // Kirim kembali hasil yang sukses
    return res.status(200).json(result.data);

  } catch (error) {
    console.error("Error di serverless function:", error);
    return res.status(500).json({ message: "Terjadi error di server." });
  }
}