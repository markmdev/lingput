import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.mark.parametrize("text, expected", [
    ("Das ist ein Ball.", {"lemma": "Ball", "article": "der", "sentence": "Das ist ein Ball."}),
    ("Das ist ein Auto.", {"lemma": "Auto", "article": "das", "sentence": "Das ist ein Auto."})
])
def test_basic_noun(text, expected):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    assert expected in data

@pytest.mark.parametrize("text, lemma_expected", [
    ("Ich stehe jeden Tag um sieben Uhr auf.", "aufstehen"),
    ("Er steht auf.", "aufstehen"),
    ("Sie steht immer um acht auf.", "aufstehen")
])
def test_separable_verb(text, lemma_expected):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    lemmas = [item["lemma"] for item in data]
    assert lemma_expected in lemmas

@pytest.mark.parametrize("text, noun, expected_article", [
    ("Ich habe einem Hund geholfen.", "Hund", "der"),
    ("Ich habe einer Katze geholfen.", "Katze", "die")
])
def test_article_normalization(text, noun, expected_article):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    item = next((x for x in data if x["lemma"] == noun), None)
    assert item is not None
    assert item["article"] == expected_article

@pytest.mark.parametrize("text, forbidden", [
    ("Ich sehe meinen Hund.", ["mein", "Ich"]),
    ("Du kennst dein Auto.", ["dein", "Du"])
])
def test_no_pronouns_or_determiners(text, forbidden):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    for word in forbidden:
        assert word not in lemmas

@pytest.mark.parametrize("text, noun, expected_sentence, expected_article", [
    ("Der Hund bellt. Die Katze miaut.", "Hund", "Der Hund bellt.", "der"),
    ("Der Hund bellt. Die Katze miaut.", "Katze", "Die Katze miaut.", "die"),
    ("Das Kind spielt. Der Vogel singt.", "Kind", "Das Kind spielt.", "das"),
    ("Das Kind spielt. Der Vogel singt.", "Vogel", "Der Vogel singt.", "der")
])
def test_multiple_sentences(text, noun, expected_sentence, expected_article):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    item = next((x for x in data if x["lemma"].lower() == noun.lower()), None)
    assert item is not None
    assert item["sentence"] == expected_sentence
    assert item["article"] == expected_article

@pytest.mark.parametrize("text, noun", [
    ("Der Hund läuft. Der Hund bellt.", "Hund"),
    ("Die Blume blüht. Die Blume duftet.", "Blume")
])
def test_repeated_tokens(text, noun):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    count = sum(1 for x in data if x["lemma"].lower() == noun.lower())
    assert count == 1

@pytest.mark.parametrize("text, contained, not_contained", [
    ("Der Hund läuft 100 Meter.", ["Meter"], ["100"]),
    ("Er rennt 50 Kilometer.", ["Kilometer"], ["50"])
])
def test_ignore_non_alpha_tokens(text, contained, not_contained):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    for word in contained:
        assert word in lemmas
    for word in not_contained:
        assert word not in lemmas

@pytest.mark.parametrize("text, noun, expected_article", [
    ("Ich sehe eine große Blume.", "Blume", "die"),
    ("Er hat eine schöne Katze.", "Katze", "die")
])
def test_article_with_adjective(text, noun, expected_article):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    item = next((x for x in data if x["lemma"].lower() == noun.lower()), None)
    assert item is not None
    assert item["article"] == expected_article

@pytest.mark.parametrize("text, forbidden", [
    ("Er rennt schnell.", ["Er"]),
    ("Sie lacht laut.", ["Sie"])
])
def test_pronoun_exclusion(text, forbidden):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    for word in forbidden:
        assert word not in lemmas

@pytest.mark.parametrize("text, forbidden", [
    ("Seine Katze schläft.", ["Seine"]),
    ("Meine Freunde kommen.", ["Meine"])
])
def test_determiner_exclusion(text, forbidden):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    for word in forbidden:
        assert word not in lemmas

@pytest.mark.parametrize("text, lemma_expected", [
    ("Er räumt auf.", "aufräumen"),
    ("Sie räumt jeden Morgen auf.", "aufräumen")
])
def test_separable_verb_räumen(text, lemma_expected):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    assert lemma_expected in lemmas

@pytest.mark.parametrize("text, lemma1, lemma2", [
    ("Er steht auf und räumt auf.", "aufstehen", "aufräumen"),
    ("Sie steht auf und räumt auf.", "aufstehen", "aufräumen"),
    ("Wir stehen auf und räumen auf.", "aufstehen", "aufräumen")
])
def test_multiple_separable_verbs(text, lemma1, lemma2):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    assert lemma1 in lemmas
    assert lemma2 in lemmas

@pytest.mark.parametrize("text", [
    "",
    "   "
])
def test_empty_text(text):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    assert data == []

@pytest.mark.parametrize("text, included", [
    ("Der schnelle Hund rennt.", ["schnell"]),
    ("Die rote Blume blüht.", ["rot"])
])
def test_adjective_inclusion(text, included):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    for word in included:
        assert word in lemmas

@pytest.mark.parametrize("text, noun, expected_article", [
    ("Kinder spielen im Park.", "Kind", None),
    ("Autos fahren schnell.", "Auto", None)
])
def test_plural_noun_without_article(text, noun, expected_article):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    item = next((x for x in data if x["lemma"].lower() == noun.lower()), None)
    assert item is not None
    assert item["article"] == expected_article

@pytest.mark.parametrize("text", [
    "Ich, du, der, die, das.",
    "mein, dein, sein, unser, euer"
])
def test_only_det_and_pron(text):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    assert data == []

@pytest.mark.parametrize("text", [
    "1234 !@#$",
    "5678 %$#@!"
])
def test_text_with_numbers_and_symbols(text):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    assert data == []

@pytest.mark.parametrize("text, noun", [
    ("Hund, hund, HUND.", "hund"),
    ("Ball, BALL, ball.", "ball")
])
def test_mixed_casing(text, noun):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    count = sum(1 for x in data if x["lemma"].lower() == noun.lower())
    assert count == 1

@pytest.mark.parametrize("text, lemma_expected", [
    ("Er steht manchmal auf.", "aufstehen"),
    ("Sie steht manchmal um 7 Uhr auf.", "aufstehen")
])
def test_separables_with_extra_tokens(text, lemma_expected):
    response = client.post("/lemmatize", json={"text": text})
    lemmas = [x["lemma"] for x in response.json()["lemmas"]]
    assert lemma_expected in lemmas

@pytest.mark.parametrize("text, noun, expected_article", [
    ("Der Hund und die Katze spielen.", "Hund", "der"),
    ("Der Hund und die Katze spielen.", "Katze", "die"),
    ("Die Blume und der Baum wachsen.", "Blume", "die"),
    ("Die Blume und der Baum wachsen.", "Baum", "der")
])
def test_multiple_articles_in_sentence(text, noun, expected_article):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    item = next((x for x in data if x["lemma"].lower() == noun.lower()), None)
    assert item is not None
    assert item["article"] == expected_article

@pytest.mark.parametrize("text, expected_lemmas", [
    ("Er steht. Auf!", ["stehen", "auf"]),
])
def test_separable_verb_different_sentence(text, expected_lemmas):
    response = client.post("/lemmatize", json={"text": text})
    data = response.json()["lemmas"]
    lemmas = [x["lemma"] for x in data]
    for lemma in expected_lemmas:
        assert lemma in lemmas
    assert "aufstehen" not in lemmas
