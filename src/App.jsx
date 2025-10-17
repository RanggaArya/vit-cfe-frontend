import React, { useState } from 'react';
import './App.css';

// GANTI DENGAN URL API ENDPOINT GRADIO ANDA!
const API_URL = "https://ranggaarya-vit-compound-expression.hf.space/run/predict";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setPrediction("");
    setConfidence("");
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Pilih file gambar terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Ubah file gambar menjadi format base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        // 2. Kirim data ke API Hugging Face
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_name: "/predict_and_visualize", 
            data: [
              {
                "data": base64Image,
                "name": selectedFile.name
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // 3. Ambil hasil prediksi dari respons API
        // Indeks [3] adalah output Markdown "Hasil Prediksi Akhir"
        const predictionText = result.data[3];

        // Ekstrak label dan confidence dari teks
        const predMatch = predictionText.match(/\*\*Prediction:\*\* (.*?)\n/);
        const confMatch = predictionText.match(/\*\*Confidence:\*\* ([\d.]+%)/);

        if (predMatch && confMatch) {
          setPrediction(predMatch[1]);
          setConfidence(confMatch[1]);
        } else {
           setError("Gagal mem-parsing hasil prediksi dari API.");
        }

      } catch (e) {
        console.error("Error:", e);
        setError("Terjadi kesalahan saat menghubungi model AI. Coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      setError("Gagal membaca file gambar.");
      setIsLoading(false);
    };
  };

  return (
    <div className="container">
      <h1>Klasifikasi Ekspresi Wajah</h1>
      <p>Unggah gambar wajah untuk dianalisis oleh model ViT.</p>

      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Menganalisis...' : 'Klasifikasikan'}
      </button>

      {error && <p className="error">{error}</p>}

      {prediction && (
        <div className="result">
          <h2>Hasil Prediksi:</h2>
          <p><strong>Ekspresi:</strong> {prediction}</p>
          <p><strong>Tingkat Keyakinan:</strong> {confidence}</p>
        </div>
      )}
    </div>
  );
}

export default App;
