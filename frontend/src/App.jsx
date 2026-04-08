import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Replace with the URL from your Render Backend "Settings" page
const API_URL = " https://statepredict.onrender.com";

const handlePredict = async (data) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  setPrice(result.prediction);
};
  const [formData, setFormData] = useState({
    longitude: -119.5,
    latitude: 37.0,
    housing_median_age: 30,
    total_rooms: 2500,
    total_bedrooms: 500,
    population: 1200,
    households: 450,
    median_income: 4.5,
    ocean_proximity: '<1H OCEAN'
  });

  const [activeTab, setActiveTab] = useState('Predict');
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const oceanProximities = [
    { label: '<1H OCEAN', icon: '🌊', value: '<1H OCEAN' },
    { label: 'INLAND', icon: '⛰️', value: 'INLAND' },
    { label: 'ISLAND', icon: '🏝️', value: 'ISLAND' },
    { label: 'NEAR BAY', icon: '⛵', value: 'NEAR BAY' },
    { label: 'NEAR OCEAN', icon: '🏖️', value: 'NEAR OCEAN' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || value
    }));
  };

  const setOceanProximity = (value) => {
    setFormData(prev => ({ ...prev, ocean_proximity: value }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        longitude: formData.longitude,
        latitude: formData.latitude,
        housing_median_age: formData.housing_median_age,
        total_rooms: formData.total_rooms,
        total_bedrooms: formData.total_bedrooms,
        population: formData.population,
        households: formData.households,
        median_income: formData.median_income,
        ocean_proximity_lt1h_ocean: formData.ocean_proximity === '<1H OCEAN' ? 1.0 : 0.0,
        ocean_proximity_inland: formData.ocean_proximity === 'INLAND' ? 1.0 : 0.0,
        ocean_proximity_island: formData.ocean_proximity === 'ISLAND' ? 1.0 : 0.0,
        ocean_proximity_near_bay: formData.ocean_proximity === 'NEAR BAY' ? 1.0 : 0.0,
        ocean_proximity_near_ocean: formData.ocean_proximity === 'NEAR OCEAN' ? 1.0 : 0.0,
      };

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setPredictedPrice(data.predicted_price);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial prediction
  useEffect(() => {
    handlePredict();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value) => {
    if (value === null) return '---';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-container">
          <img src="/logo.png" alt="PredictState Logo" className="app-logo" />
          <h1>PredictState</h1>
        </div>
        <p>Advanced California House Price Evaluation Model</p>
      </header>

      <div className="nav-tabs">
        {['Predict', 'Feature Guide', 'Resources'].map(tab => (
          <button 
            key={tab} 
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="main-content" style={{ display: activeTab === 'Predict' ? 'grid' : 'block' }}>
        {activeTab === 'Predict' && (
        <>
        <section className="card">
          <div className="form-grid">
            
            <div className="input-group">
              <div className="input-header">
                <span>Location (Lon/Lat)</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" name="longitude" value={formData.longitude} onChange={handleInputChange} step="0.1" min="-125" max="-114" />
                <input type="number" name="latitude" value={formData.latitude} onChange={handleInputChange} step="0.1" min="32" max="42" />
              </div>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <div className="segment-control">
                {oceanProximities.map(op => (
                   <button 
                     key={op.value}
                     className={`segment-btn ${formData.ocean_proximity === op.value ? 'active' : ''}`}
                     onClick={() => setOceanProximity(op.value)}
                   >
                     {op.icon} {op.label}
                   </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <div className="input-header">
                <span>Median Income ($10ks)</span>
                <input type="number" name="median_income" value={formData.median_income} onChange={handleInputChange} step="0.1" max="15" min="0" />
              </div>
              <input type="range" name="median_income" min="0" max="15" step="0.1" value={formData.median_income} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <div className="input-header">
                <span>Housing Median Age</span>
                <input type="number" name="housing_median_age" value={formData.housing_median_age} onChange={handleInputChange} min="1" max="52"/>
              </div>
              <input type="range" name="housing_median_age" min="1" max="52" value={formData.housing_median_age} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <div className="input-header">
                <span>Total Rooms</span>
                <input type="number" name="total_rooms" value={formData.total_rooms} onChange={handleInputChange} />
              </div>
              <input type="range" name="total_rooms" min="10" max="10000" value={formData.total_rooms} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <div className="input-header">
                <span>Total Bedrooms</span>
                <input type="number" name="total_bedrooms" value={formData.total_bedrooms} onChange={handleInputChange} />
              </div>
              <input type="range" name="total_bedrooms" min="1" max="5000" value={formData.total_bedrooms} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <div className="input-header">
                <span>Population</span>
                <input type="number" name="population" value={formData.population} onChange={handleInputChange} />
              </div>
              <input type="range" name="population" min="10" max="15000" value={formData.population} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <div className="input-header">
                <span>Households</span>
                <input type="number" name="households" value={formData.households} onChange={handleInputChange} />
              </div>
              <input type="range" name="households" min="10" max="5000" value={formData.households} onChange={handleInputChange} />
            </div>

          </div>
        </section>

        <section className="results-panel">
          <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
            <div className="price-display">
              <span className="price-label">Estimated Market Value</span>
              <span className={`price-value ${isLoading ? 'loading' : ''}`}>
                {formatCurrency(predictedPrice)}
              </span>
              {error && <span style={{color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem'}}>{error}</span>}
            </div>
          </div>
          
          <button 
            className="predict-btn" 
            onClick={handlePredict}
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Recalculate Price'}
          </button>
        </section>
        </>
        )}

        {activeTab === 'Feature Guide' && (
          <section className="about-section">
            <h2>Understanding the Features</h2>
            <div className="feature-list">
              <div className="feature-item">
                <h3>Median Income</h3>
                <p>This is the most critical feature in predicting housing prices in California. It represents the median income of households around the location, scaled in tens of thousands of dollars.</p>
              </div>
              <div className="feature-item">
                <h3>Location (Longitude & Latitude)</h3>
                <p>Coordinates map the exact physical location of the property. Properties situated in densely populated urban zones or along the coastline carry significant valuation premiums.</p>
              </div>
              <div className="feature-item">
                <h3>Housing Median Age</h3>
                <p>The median age of housing units in the neighborhood. Newly built homes carry a premium, while historic neighborhoods occasionally witness a decline depending on overall property condition and state trends.</p>
              </div>
              <div className="feature-item">
                <h3>Ocean Proximity</h3>
                <p>California housing prices vary wildly based on proximity to the ocean or a bay. Island and Near Ocean properties score the highest evaluations, whereas Inland properties are significantly cheaper.</p>
              </div>
              <div className="feature-item">
                <h3>Rooms & Population Metrics</h3>
                <p>Metrics such as Total Rooms, Total Bedrooms, and specific neighborhood population densities give the model local spatial scales allowing it to predict community evaluations relative to area demand.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Resources' && (
          <section className="resource-section">
            <h2>Recommended Real Estate Tours</h2>
            <p style={{marginBottom: '2rem', color: 'var(--text-muted)'}}>Explore high-end luxury housing in California through these incredible tours!</p>
            <div className="video-grid">
              {['Bb2o-Sf1Xn4', 'U8Cd_McCdow', 'PHhuIg6oLC4'].map((vidId, i) => (
                <div className="video-card" key={vidId} onClick={() => setActiveVideo(vidId)}>
                   <div className="thumbnail-wrapper">
                     <img src={`https://img.youtube.com/vi/${vidId}/hqdefault.jpg`} alt="Video Thumbnail" className="video-thumbnail" />
                     <div className="thumbnail-overlay">
                        <span className="play-icon">▶</span>
                     </div>
                   </div>
                   <div className="video-info">
                     <h4>Exclusive Estate Tour {i + 1}</h4>
                     <p>Click to watch</p>
                   </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <a href="https://www.youtube.com/results?search_query=high+end+luxury+real+estate+tour" target="_blank" rel="noopener noreferrer" className="youtube-more-btn">
                Explore More on YouTube ↗
              </a>
            </div>
          </section>
        )}

      </main>

      {activeVideo && (
        <div className="video-modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setActiveVideo(null)}>×</button>
            <iframe 
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&color=white`} 
              title="Luxury Home Tour" 
              allow="autoplay; fullscreen"
              style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: '8px' }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
