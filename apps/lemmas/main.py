from fastapi import FastAPI
from pydantic import BaseModel
import spacy

app = FastAPI()
nlp = spacy.load("de_core_news_md")

class TextInput(BaseModel):
    text: str

ARTICLE_MAP = {
    "der": "der", "die": "die", "das": "das",
    "den": "der", "dem": "der", "des": "der",
    "ein": "der", "eine": "die", "einem": "der",
    "einen": "der", "einer": "die", "eines": "der",
    "mein": "der", "meine": "die", "meinen": "der", "meinem": "der", "meines": "der",
    "dein": "der", "deine": "die", "deinen": "der", "deinem": "der", "deines": "der",
    "sein": "der", "seine": "die", "seinen": "der", "seinem": "der", "seines": "der",
    "ihr": "der", "ihre": "die", "ihren": "der", "ihrem": "der", "ihres": "der",
    "unser": "der", "unsere": "die", "unseren": "der", "unserem": "der", "unseres": "der",
    "euer": "der", "eure": "die", "eueren": "der", "eurem": "der", "eures": "der",
}

# Common German separable verb particles
SEPARABLE_PARTICLES = {
    "ab", "an", "auf", "aus", "bei", "ein", "fest", "fort", "los", "mit",
    "nach", "nieder", "vor", "weg", "weiter", "zu", "zurück", "zusammen"
}

def find_article(token):
    for left in reversed(list(token.lefts)):
        cleaned = left.text.lower().strip(" ,.")
        if cleaned in ARTICLE_MAP:
            if cleaned in {"ein", "eine"} and token.morph.get("Gender"):
                gender = token.morph.get("Gender")[0]
                return {"Neut": "das", "Masc": "der", "Fem": "die"}.get(gender, None)
            return ARTICLE_MAP.get(cleaned)
    return None

def try_combine_separable_verb(token):
    if token.pos_ not in ("VERB", "AUX"):
        return None
    for child in token.children:
        if child.tag_ == "PTKVZ":
            return child.text + token.lemma_, child
    return None

@app.post("/lemmatize")
async def lemmatize_text(input: TextInput):
    doc = nlp(input.text)
    sentences = list(doc.sents) or [doc]
    seen = set()
    results = []

    CONTENT_POS = {"NOUN", "PROPN", "ADJ", "VERB"}

    for sent in sentences:
        for token in sent:
            if not token.is_alpha:
                continue

            cleaned = token.text.lower().strip(" ,.")
            if cleaned in ARTICLE_MAP or token.pos_ in ("PRON", "DET"):
                continue

            # Drop basic function words (stopwords and non-content POS)
            if token.is_stop and token.pos_ not in CONTENT_POS and token.tag_ != "PTKVZ":
                # Allow standalone separable particle like "Auf!" even if spaCy tags it as stopword
                alpha_count = sum(1 for t in token.sent if t.is_alpha)
                if not (token.text.lower() in SEPARABLE_PARTICLES and token.dep_ == "ROOT" and alpha_count == 1):
                    continue

            # Skip common function POS outright
            if token.pos_ in ("ADP", "AUX", "CCONJ", "SCONJ", "INTJ", "SYM"):
                # Exception: allow standalone separable particle like "Auf!" even if tagged ADP
                if token.pos_ == "ADP":
                    alpha_count = sum(1 for t in token.sent if t.is_alpha)
                    if token.text.lower() in SEPARABLE_PARTICLES and token.dep_ == "ROOT" and alpha_count == 1:
                        pass
                    else:
                        continue
                else:
                    continue

            # Special handling for separable particles: include standalone PTKVZ
            if token.pos_ == "PART":
                if token.tag_ == "PTKVZ":
                    # If the particle is attached to a verb in the same sentence, skip it here;
                    # it will be accounted for by the verb combination logic.
                    if token.head is not None and token.head.pos_ in ("VERB", "AUX") and token.head.sent == token.sent:
                        continue
                    # Otherwise, allow standalone PTKVZ like "Auf!"
                else:
                    # Non-PTKVZ particles are treated as function words
                    continue

            combined_result = try_combine_separable_verb(token)
            if combined_result:
                lemma, particle_token = combined_result
                seen.add(particle_token.text.lower())
            else:
                lemma = token.lemma_

            if lemma.lower() in seen:
                continue
            seen.add(lemma.lower())

            article = None
            if token.pos_ in ("NOUN", "PROPN"):
                article = find_article(token)

                if not article and token.dep_ == "compound" and token.head != token:
                    article = find_article(token.head)

                if article and token.morph.get("Gender"):
                    gender = token.morph.get("Gender")[0]
                    expected_article = {"Masc": "der", "Fem": "die", "Neut": "das"}.get(gender)
                    if token.morph.get("Number") and token.morph.get("Number")[0] == "Plur":
                        if expected_article and article != expected_article:
                            article = expected_article

                # Only infer a default article from gender for singular nouns
                if not article:
                    number = token.morph.get("Number")
                    if number and number[0] == "Sing" and token.morph.get("Gender"):
                        gender = token.morph.get("Gender")[0]
                        article = {"Masc": "der", "Fem": "die", "Neut": "das"}.get(gender)

            results.append({
                "lemma": lemma,
                "article": article,
                "sentence": sent.text
            })

    return {"lemmas": results}
