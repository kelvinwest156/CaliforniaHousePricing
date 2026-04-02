
from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel, model_validator

model = joblib.load("forest_model.joblib")

app = FastAPI(title="California House Price Prediction API")


class HouseData(BaseModel):
    longitude: float
    latitude: float
    housing_median_age: float
    total_rooms: float
    total_bedrooms: float
    population: float
    households: float
    median_income: float
    ocean_proximity_lt1h_ocean: float
    ocean_proximity_inland: float
    ocean_proximity_island: float
    ocean_proximity_near_bay: float
    ocean_proximity_near_ocean: float
    bedroom_ratio: float = None
    household_rooms: float = None

    @model_validator(mode='after')
    def compute_engineered_features(self):
        self.bedroom_ratio = self.total_bedrooms / self.total_rooms
        self.household_rooms = self.total_rooms / self.households
        return self

@app.get("/")
def home():
    return {"message":"Welcome to the California House Price Prediction API!"}

@app.post("/predict")
def predict_price(data:HouseData):
    features = np.array(
        [[
        data.longitude,
        data.latitude,
        data.housing_median_age,
        data.total_rooms,
        data.total_bedrooms,
        data.population,
        data.households,
        data.median_income,
        data.ocean_proximity_lt1h_ocean,
        data.ocean_proximity_inland,
        data.ocean_proximity_island,
        data.ocean_proximity_near_bay,
        data.ocean_proximity_near_ocean,
        data.bedroom_ratio,
        data.household_rooms
        ]]
    )
    prediction = model.predict(features)
    return {"predicted_price": float(prediction[0])}


