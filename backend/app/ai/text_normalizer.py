import re


ABBREVIATIONS = {
    r"\bул\.\b": "улица",
    r"\bбул\.\b": "булевард",
    r"\bжк\b": "жилищен комплекс",
    r"\bкв\.\b": "квартал",
    r"\bпл\.\b": "площад",
}


COMMON_ASR_ERRORS = {
    "болевард": "булевард",
    "болеварда": "булеварда",
    "болеварт": "булевард",

    "улцата": "улицата",
    "улицатаа": "улицата",
    "улицаа": "улица",
}



def normalize_bg_text(text: str) -> str:
    text = text.lower()

    for pattern, replacement in ABBREVIATIONS.items():
        text = re.sub(pattern, replacement, text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()



def correct_common_asr_errors(text: str) -> str:
    words = text.split()
    corrected_words = []

    for word in words:
        corrected_word = COMMON_ASR_ERRORS.get(word, word)
        corrected_words.append(corrected_word)

    return " ".join(corrected_words)