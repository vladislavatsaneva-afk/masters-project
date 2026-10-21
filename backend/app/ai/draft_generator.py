import re
from typing import Dict
from app.ai.text_normalizer import (normalize_bg_text, correct_common_asr_errors)
from app.services.geocoding_service import geocoding_service
from app.ai.ruse_locations import (
    RUSE_STREETS,
    RUSE_BOULEVARDS,
    RUSE_NEIGHBORHOODS,
    RUSE_LANDMARKS
)
ALL_RUSE_LOCATIONS = (
    RUSE_STREETS +
    RUSE_BOULEVARDS +
    RUSE_NEIGHBORHOODS +
    RUSE_LANDMARKS
)


VALID_SEVERITIES = ["Low", "Medium", "High"]


TYPE_KEYWORDS = {
    1: ["шум", "силна музика", "шумен съсед", "нощен шум", "disturbance", "noise complaint"],
    2: ["лошо паркиране", "блокирал автомобил", "паркиране в нарушение", "спрял неправилно", "illegal parking"],
    3: ["подозрително лице", "странно поведение", "съмнителен човек", "подозрителна дейност", "suspicious activity"],
    4: ["семеен скандал", "битов скандал", "домашно насилие", "семеен конфликт", "domestic dispute"],
    5: ["катастрофа", "удар между коли", "ПТП", "автомобилен инцидент", "crash", "accident"],
    6: ["чупене", "драскане", "унищожаване на имущество", "щети", "vandalism"],
    7: ["обир", "откраднато", "кражба на кола", "джебчийство", "theft", "robbery"],
    8: ["хулиганство", "безредици", "агресивно поведение", "скандал на улицата", "public disturbance"],
    9: ["бой", "групов бой", "сбиване", "уличен бой", "fight", "brawl"],
    10: ["изоставена кола", "зарязан автомобил", "изоставено превозно средство", "abandoned vehicle"],
    11: ["продажба на наркотици", "дрога", "дилъри", "употреба на наркотици", "drugs", "drug dealing"],
    12: ["агресивно куче", "бездомно куче", "опасно животно", "нападение от куче", "stray animal"],
    13: ["каране с превишена скорост", "опасно шофиране", "минаване на червено", "нарушение на пътя", "traffic violation"],
    14: ["атака", "побой", "агресия", "физическо нападение", "assault"],
    15: ["изчезнал човек", "издирвано лице", "загубен човек", "missing person"],
    16: ["риск от пожар", "дим", "запалване", "опасност от инцидент", "fire hazard"],
    17: ["хакване", "онлайн измама", "фишинг", "кражба на акаунт", "cybercrime", "hacking"],
    18: ["мошеничество", "телефонна измама", "финансова измама", "лъжа", "fraud", "scam"]
}


HIGH_SEVERITY_WORDS = [
    "скандал", "насилие", "конфликт", "dispute",
    "катастрофа", "ПТП", "автомобилен инцидент", "crash", "accident",
    "обир", "кражба", "джебчийство", "theft", "robbery",
    "бой", "сбиване", "fight", "brawl",
    "наркотици", "дрога", "дилъри", "drugs",
    "атака", "побой", "агресия", "нападение", "assault",
    "изчезнал", "издирван", "загубен", "missing",
    "пожар", "дим", "запалване", "опасност", "fire",
]


MEDIUM_SEVERITY_WORDS = [
    "подозрително", "странно", "съмнителен", "suspicious activity",
    "чупене", "драскане", "унищожаване", "щети", "vandalism",
    "хулиганство", "безредици", "агресивно", "public disturbance",
    "хакване", "фишинг", "cybercrime", "hacking",
    "мошеничество", "измама", "fraud", "scam"
]


ADDRESS_PATTERNS = [
    r"(улица\s+[а-яa-z0-9\-\s]{3,60})",
    r"(булевард\s+[а-яa-z0-9\-\s]{3,60})",
    r"(жилищен комплекс\s+[а-яa-z0-9\-\s]{3,60})",
    r"(квартал\s+[а-яa-z0-9\-\s]{3,60})",
]

NAME_PATTERNS = [
    r"казвам се\s+([А-ЯA-Z][а-яa-z]+\s+[А-ЯA-Z][а-яa-z]+)",
    r"аз съм\s+([А-ЯA-Z][а-яa-z]+\s+[А-ЯA-Z][а-яa-z]+)",
    r"([А-ЯA-Z][а-яa-z]+\s+[А-ЯA-Z][а-яa-z]+)\s+се обажда",
]

ADDRESS_STOP_WORDS = [
    "има", "между", "катастрофа", "инцидент", "стана", "с", "две", "коли", "човек", "се"
]


class DraftGenerator:
    def detect_severity(self, text: str) -> str:
        text_lower = text.lower()

        for word in HIGH_SEVERITY_WORDS:
            if word in text_lower:
                return "High"
        for word in MEDIUM_SEVERITY_WORDS:
            if word in text_lower:
                return "Medium"

        return "Low"


    def detect_type_id(self, text: str):
        text_lower = text.lower()

        for type_id, keywords in TYPE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return type_id

        return None

    def extract_address(self, text: str):
        text_lower = text.lower()

        locations_sorted = sorted(
            ALL_RUSE_LOCATIONS,
            key=lambda loc: max(
                len(alias)
                for alias in loc["aliases"]
            ),
            reverse=True
        )

        for location in locations_sorted:
            for alias in location["aliases"]:
                if alias.lower() in text_lower:
                    return location["name"]

        for pattern in ADDRESS_PATTERNS:
            match = re.search(
                pattern,
                text_lower,
                re.IGNORECASE
            )

            if match:
                address = match.group(0)

                words = address.split()
                cleaned_words = []

                for word in words:
                    if word.lower() in ADDRESS_STOP_WORDS:
                        break

                    cleaned_words.append(word)

                return " ".join(cleaned_words)

        return None


    def extract_citizen_name(self, text: str):
        for pattern in NAME_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                return match.group(1)

        return None


    def calculate_confidence(
        self,
        type_id,
        address,
        citizen_name,
        severity,
    ) -> float:

        score = 0.0
        if type_id:
            score += 0.4
        if address:
            score += 0.3
        if citizen_name:
            score += 0.2
        if severity != "Low":
            score += 0.1

        return round(score, 2)


    def generate_signal_draft(self, transcript: str) -> Dict:
        normalized_text = normalize_bg_text(transcript)
        normalized_text = correct_common_asr_errors(normalized_text)
        citizen_name = self.extract_citizen_name(transcript)
        severity = self.detect_severity(normalized_text)
        type_id = self.detect_type_id(normalized_text)

        address = self.extract_address(normalized_text)
        latitude = None
        longitude = None
        if address:
            latitude, longitude = (
                geocoding_service.geocode_address(
                    address
                )
            )

        confidence = self.calculate_confidence(
            type_id,
            address,
            citizen_name,
            severity,
        )


        return {
            "summary": transcript[:250],
            "suggested_citizen_name": citizen_name,
            "suggested_type_id": type_id,
            "suggested_severity": severity,
            "suggested_address": address,
            "suggested_latitude": latitude,
            "suggested_longitude": longitude,
            "confidence_score": confidence,
            "extracted_entities": {
                "address": address,
                "citizen_name": citizen_name,
                "severity": severity,
                "type_id": type_id
            }
        }


draft_generator = DraftGenerator()