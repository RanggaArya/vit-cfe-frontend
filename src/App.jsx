import React, { useState } from 'react';
import './App.css';

// URL API sekarang adalah 'asisten' lokal kita
const API_URL = "/api/predict";

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

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: reader.result, // Kirim base64 string
            filename: selectedFile.name
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resultData = await response.json();

        // Ambil hasil dari respons 'asisten'
        const predictionText = resultData[3]; // Output Markdown

        const predMatch = predictionText.match(/\*\*Prediction:\*\* (.*?)\n/);
        const confMatch = predictionText.match(/\*\*Confidence:\*\* ([\d.]+%)/);

        if (predMatch && confMatch) {
          setPrediction(predMatch[1]);
          setConfidence(confMatch[1]);
        } else {
           setError("Gagal mem-parsing hasil prediksi.");
        }

      } catch (e) {
        console.error("Error:", e);
        setError("Terjadi kesalahan saat menghubungi model AI. Coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
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
