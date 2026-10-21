import requests
from app.ai.ruse_locations import (
    RUSE_STREETS,
    RUSE_BOULEVARDS,
    RUSE_NEIGHBORHOODS,
    RUSE_LANDMARKS,
    RUSE_POI
)

ALL_RUSE_LOCATIONS = (
    RUSE_STREETS +
    RUSE_BOULEVARDS +
    RUSE_NEIGHBORHOODS +
    RUSE_LANDMARKS +
    RUSE_POI
)



class GeocodingService:

    def geocode_address(self, address: str):

        if not address:
            return None, None

        address_lower = address.lower()


        for location in ALL_RUSE_LOCATIONS:

            if location["name"].lower() == address_lower:
                print(
                    f"[LOCAL GEOCODING] "
                    f"{address} -> "
                    f"{location['lat']}, {location['lon']}"
                )

                return (
                    location["lat"],
                    location["lon"]
                )

            for alias in location["aliases"]:

                if alias.lower() == address_lower:
                    print(
                        f"[LOCAL GEOCODING] "
                        f"{address} -> "
                        f"{location['lat']}, {location['lon']}"
                    )

                    return (
                        location["lat"],
                        location["lon"]
                    )


        try:

            query = f"{address}, Русе, България"

            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": 1
                },
                headers={
                    "User-Agent": "PoliceSignalsSystem/1.0"
                },
                timeout=10
            )

            data = response.json()

            if not data:
                print(f"[GEOCODING FAILED] {query}")
                return None, None

            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])

            print(
                f"[NOMINATIM GEOCODING] "
                f"{query} -> "
                f"{lat}, {lon}"
            )

            return lat, lon

        except Exception as e:

            print(
                f"[GEOCODING ERROR] {e}"
            )

            return None, None


geocoding_service = GeocodingService()