import requests
import json
import sys
import pandas as pd
import numpy as np
import random

from sklearn.preprocessing import StandardScaler, OneHotEncoder, MultiLabelBinarizer
from sklearn.compose import make_column_transformer
from sklearn.metrics import pairwise_distances

BASE_URL = "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net"

def get_user_favorites(headers):
    response = requests.get(f"{BASE_URL}/users/favorites", headers=headers)
    response.raise_for_status()  
    return response.json()

def get_all_restaurants(city, headers):
    response = requests.get(f"{BASE_URL}/restaurants/{city}", headers=headers)
    response.raise_for_status()
    return response.json()

def recommend(city, token):
    cuisine_weight=10.0
    headers = { "Authorization": f"Bearer {token}" }
    #Fetch data
    all_restaurants = get_all_restaurants(city, headers)
    favorite_restaurants = get_user_favorites(headers)

    # Convert to DataFrame
    df_all = pd.DataFrame(all_restaurants)
    df_favs = pd.DataFrame(favorite_restaurants)

    # Convert cuisines list to binary features
    mlb = MultiLabelBinarizer()
    df_all_cuisine = pd.DataFrame(mlb.fit_transform(df_all["cuisines"]), columns=mlb.classes_)
    df_favs_cuisine = pd.DataFrame(mlb.transform(df_favs["cuisines"]), columns=mlb.classes_)

    df_all_rest = df_all.drop(columns=["cuisines"])
    df_favs_rest = df_favs.drop(columns=["cuisines"])

    #Preprocess data
    preprocessor = make_column_transformer(
        (OneHotEncoder(sparse_output=False, handle_unknown="ignore"), ["price_range_usd", "has_delivery"]),
        (StandardScaler(), ["reviews", "rating"]),
        remainder="drop"
    ).set_output(transform = "pandas")

    # Fit on all, transform both
    all_features_rest = preprocessor.fit_transform(df_all_rest)
    all_cuisine_features = df_all_cuisine * cuisine_weight

    # Select a random favorite
    random_idx = random.randint(0, len(df_favs_rest) - 1)
    one_fav_rest = df_favs_rest.iloc[[random_idx]]  
    one_fav_cuisine = df_favs_cuisine.iloc[[random_idx]] * cuisine_weight

    # Transform selected favorite
    fav_features_rest = preprocessor.transform(one_fav_rest)

    # Combine features
    all_features = np.hstack([all_features_rest.values, all_cuisine_features.values])
    fav_features = np.hstack([fav_features_rest.values, one_fav_cuisine.values])

    # Compute distances & recommend
    dists = pairwise_distances(fav_features, all_features)
    best = dists.argsort().flatten()[:11]  # top 10 closest matches
    
    
    recommendations = df_all.iloc[best].to_dict(orient="records")
    reference_favorite = df_favs.iloc[random_idx].to_dict()

    return {
        "recommendations": recommendations,
        "reference_favorite": reference_favorite
    }

if __name__ == "__main__":
    city = sys.argv[1]
    token = sys.argv[2]
    result = recommend(city, token)
    print(json.dumps(result))