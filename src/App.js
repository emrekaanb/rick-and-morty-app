import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tempName, setTempName] = useState("");
  const [characters, setCharacters] = useState([]); // Karakter verileri
  const [filters, setFilters] = useState({ name: "", status: "" }); // Filtreler
  const [page, setPage] = useState(1); // Sayfa numarası
  const [pageSize, setPageSize] = useState(20); // Sayfa boyutu
  const [expandedCharacterId, setExpandedCharacterId] = useState(null); // Detaylı karakter ID
  const [error, setError] = useState(null); // Hata durumu
  const [totalCharacters, setTotalCharacters] = useState(0); // Toplam karakter sayısı

  const API_URL = "https://rickandmortyapi.com/api/character";

  // API'den karakter verilerini çek
  const fetchCharacters = async () => {
    try {
      const params = { page, name: filters.name, status: filters.status };
      const response = await axios.get(API_URL, { params });
      const slicedResults = response.data.results.slice(0, pageSize); // Sayfa boyutunu uygula
      setCharacters(slicedResults);
      setTotalCharacters(response.data.info.count);
      setError(null);
    } catch (err) {
      setError("Veri alınırken bir hata oluştu.");
      setCharacters([]);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [page, filters, pageSize]);

  // Detaylı bilgi çekmek için API'den ek veriler al
  const fetchCharacterDetails = async (character) => {
    const firstEpisodeUrl = character.episode[0];
    try {
      const locationResponse = await axios.get(character.location.url);
      const firstEpisodeResponse = await axios.get(firstEpisodeUrl);
      return {
        lastLocation: locationResponse.data.name,
        firstSeen: firstEpisodeResponse.data.name,
      };
    } catch (err) {
      return { lastLocation: "Bilinmiyor", firstSeen: "Bilinmiyor" };
    }
  };

  // Satır tıklandığında detayları getir
  const handleRowClick = async (character) => {
    if (expandedCharacterId === character.id) {
      setExpandedCharacterId(null); // Kapat
    } else {
      const details = await fetchCharacterDetails(character);
      character.lastLocation = details.lastLocation;
      character.firstSeen = details.firstSeen;
      setExpandedCharacterId(character.id);
    }
  };

  return (
    <div className="App">
      <h1>Rick and Morty Karakter Tablosu</h1>

      {/* Filtreler */}
      <div className="filters">
        <input
          type="text"
          placeholder="İsme göre filtrele"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setFilters({ ...filters, name: tempName })
              setPage(1); // Sayfayı 1'e sıfırla
            }
          }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Durum (Hepsi)</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Hata */}
      {error && <div className="error">{error}</div>}

      {/* Tablo */}
      <table>
        <thead>
          <tr>
            <th>İsim</th>
            <th>Durum</th>
            <th>Tür</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((character) => (
            <React.Fragment key={character.id}>
              <tr
                onClick={() => handleRowClick(character)}
                style={{ cursor: "pointer" }}
              >
                <td>{character.name}</td>
                <td>{character.status}</td>
                <td>{character.species}</td>
              </tr>

              {/* Detaylı Bilgiler */}
              {expandedCharacterId === character.id && (
                <tr className="details-row">
                  <td colSpan="3">
                    <div className="character-details">
                      <img
                        src={character.image}
                        alt={character.name}
                        style={{ width: "100px", borderRadius: "8px" }}
                      />
                      <div>
                        <p>
                          <strong>Son Konum:</strong>{" "}
                          {character.lastLocation || "Bilinmiyor"}
                        </p>
                        <p>
                          <strong>İlk Görüldüğü Yer:</strong>{" "}
                          {character.firstSeen || "Bilinmiyor"}
                        </p>
                        <p>
                          <strong>Cinsiyet:</strong> {character.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Sayfalama */}
      <div className="pagination">
        <button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>
          Önceki
        </button>
        <span>
          Sayfa {page} / {Math.ceil(totalCharacters / pageSize)}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= Math.ceil(totalCharacters / pageSize)}
        >
          Sonraki
        </button>
      </div>

      {/* Sayfa numarası kutusu */}
      <div style={{ marginTop: "15px" }}>
        <input
          type="number"
          min="1"
          max={Math.ceil(totalCharacters / pageSize)}
          placeholder={page}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const targetPage = Number(e.target.value);
              if (
                targetPage >= 1 &&
                targetPage <= Math.ceil(totalCharacters / pageSize)
              ) {
                setPage(targetPage);
              } else {
                alert("Geçerli bir sayfa numarası girin!");
              }
            }
          }}
          style={{
            width: "60px",
            padding: "8px",
            borderRadius: "5px",
            border: "2px solid #00ff9f",
            backgroundColor: "#2f2f2f",
            color: "#f5f5f5",
            textAlign: "center",
            fontSize: "1rem",
          }}
        />
      </div>
    </div>
  );
}

export default App;
