"""Read-only access to Aina's Supabase tables.

This module is data access only. It fetches Vadodara place/food records and
formats them as text for Gemini. It contains no scoring, ranking, outlines
of recommendations, or any other intelligence — Gemini reasons over whatever
text this module returns.
"""

import math
from typing import Any
from urllib.parse import quote

import httpx

VADODARA_CITY = "Vadodara"


class SupabaseConfigurationError(RuntimeError):
    """Raised when Supabase configuration is incomplete."""


class SupabaseDataError(RuntimeError):
    """Raised when Supabase cannot return valid data."""


def _haversine_km(
    lat1: float, lng1: float, lat2: float, lng2: float
) -> float:
    """Straight-line distance between two coordinates (data lookup helper)."""
    radius_km = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return 2 * radius_km * math.asin(math.sqrt(a))


class SupabaseRepository:
    def __init__(self, url: str | None, key: str | None) -> None:
        self.url = url.rstrip("/") if url else None
        self.key = key

    async def _get(self, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        if not self.url or not self.key:
            raise SupabaseConfigurationError(
                "SUPABASE_URL and SUPABASE_KEY are required"
            )
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.url}/rest/v1/{table}",
                    params=params,
                    headers={
                        "apikey": self.key,
                        "Authorization": f"Bearer {self.key}",
                    },
                )
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SupabaseDataError("Supabase read request failed") from exc
        if not isinstance(data, list) or not all(
            isinstance(row, dict) for row in data
        ):
            raise SupabaseDataError("Supabase returned an unexpected response")
        return data

    async def list_places(
        self, *, city: str | None = VADODARA_CITY
    ) -> list[dict[str, Any]]:
        """Return all place records, optionally filtered to a city."""
        params: dict[str, str] = {"select": "*", "order": "name.asc"}
        rows = await self._get("places", params)
        if city is None:
            return rows
        return [
            row
            for row in rows
            if city.lower() in str(row.get("city", "")).lower()
        ]

    async def get_place_by_id(self, place_id: str) -> dict[str, Any] | None:
        rows = await self._get("places", {"select": "*", "id": f"eq.{quote(place_id)}"})
        return rows[0] if rows else None

    async def find_places_by_name(
        self, text: str, *, city: str | None = VADODARA_CITY
    ) -> list[dict[str, Any]]:
        """Substring name lookup over place records (retrieval, not ranking)."""
        needle = text.strip().lower()
        if not needle:
            return []
        rows = await self.list_places(city=city)
        return [
            row
            for row in rows
            if str(row.get("name", "")).strip().lower()
            and str(row.get("name", "")).strip().lower() in needle
        ]

    async def nearby_places(
        self,
        place: dict[str, Any],
        *,
        limit: int = 5,
        city: str | None = VADODARA_CITY,
    ) -> list[dict[str, Any]]:
        """Places closest to a given place record (retrieval, not ranking).

        Returns raw place records with a factual ``distance_km`` annotation so
        Gemini can describe what is nearby. Gemini decides which ones are
        worth mentioning.
        """
        lat = place.get("latitude")
        lng = place.get("longitude")
        if not isinstance(lat, (int, float)) or not isinstance(
            lng, (int, float)
        ):
            return []
        rows = await self.list_places(city=city)
        candidates = []
        for row in rows:
            if row.get("id") == place.get("id"):
                continue
            row_lat = row.get("latitude")
            row_lng = row.get("longitude")
            if not isinstance(row_lat, (int, float)) or not isinstance(
                row_lng, (int, float)
            ):
                continue
            candidates.append(
                {
                    **row,
                    "distance_km": round(
                        _haversine_km(lat, lng, row_lat, row_lng), 1
                    ),
                }
            )
        candidates.sort(key=lambda row: row["distance_km"])
        return candidates[:limit]

    async def list_food_items(
        self, *, city: str | None = VADODARA_CITY
    ) -> list[dict[str, Any]]:
        params: dict[str, str] = {
            "select": "*",
            "order": "food_specialty.asc",
        }
        rows = await self._get("food_items", params)
        if city is None:
            return rows
        return [
            row
            for row in rows
            if city.lower() in str(row.get("city", "")).lower()
        ]


def _short(value: Any, limit: int = 300) -> str:
    text = str(value or "").strip()
    return text if len(text) <= limit else text[:limit].rstrip() + "…"


def format_place_catalog(places: list[dict[str, Any]]) -> str:
    """Compact one-line-per-place overview of everything Aina knows."""
    if not places:
        return "No Vadodara places are currently in Aina's data."
    lines = []
    for place in places:
        lines.append(
            f"- {place.get('name')} ({place.get('category', 'heritage place')}): "
            f"{_short(place.get('description'), 160)}"
        )
    return (
        "Aina's Vadodara place data (these are the only places Aina can "
        "recommend or describe from verified data):\n" + "\n".join(lines)
    )


def format_place_detail(place: dict[str, Any]) -> str:
    """Full verified detail for one place record."""
    fields = (
        "name",
        "city",
        "category",
        "historical_period",
        "architectural_style",
        "description",
        "why_interesting",
        "best_for",
        "best_time_to_visit",
        "opening_hours",
        "entry_fee",
        "visit_time_minutes",
        "access_status",
    )
    lines = [
        f"{field}: {_short(place.get(field), 500)}"
        for field in fields
        if place.get(field) not in (None, "", [])
    ]
    if place.get("distance_km") is not None:
        lines.append(f"distance_km: {place['distance_km']}")
    return "Place detail:\n" + "\n".join(f"- {line}" for line in lines)


def format_food_items(items: list[dict[str, Any]]) -> str:
    if not items:
        return "No Vadodara food items are currently in Aina's data."
    lines = []
    for item in items:
        lines.append(
            f"- {item.get('food_specialty')} "
            f"({item.get('specific_place', 'Vadodara')}): "
            f"{_short(item.get('short_description'), 160)}"
        )
    return "Aina's Vadodara food data:\n" + "\n".join(lines)
