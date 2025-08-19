import spacy
import json
import re
import sys

def load_spacy_model(model="de_core_news_md"):
    """Loads the specified spaCy model and handles potential errors."""
    try:
        return spacy.load(model)
    except OSError:
        print(
            f"❌ Spacy German model '{model}' not found.\n"
            f"Please install it by running the following command in your terminal:\n"
            f"python -m spacy download {model}"
        )
        sys.exit(1) # Exit the script if the model is not available


def process_german_words(input_file_path, output_file_path):
    """
    Reads a JSON file with German words, normalizes them, extracts articles,
    filters out unwanted entries, and writes the result to a new JSON file.

    Args:
        input_file_path (str): The path to the source JSON file.
        output_file_path (str): The path for the resulting JSON file.
    """
    nlp = load_spacy_model()

    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: The input file was not found at '{input_file_path}'")
        return
    except json.JSONDecodeError:
        print(f"❌ Error: The file '{input_file_path}' is not valid JSON. Please check its formatting.")
        return

    processed_data = []
    removed_words = []
    # Customize this set to exclude specific words from the final output.
    custom_stop_words = {
        "sein", "daran", "dran", "je", "desto", "umso", "in", "und", "am",
        "von", "zu", "mit", "auf", "für", "aus", "bei", "nach", "seit"
    }

    # General POS-based filtering similar to API: keep only content words
    CONTENT_POS = {"NOUN", "PROPN", "ADJ", "VERB"}
    FUNCTION_POS = {"PRON", "DET", "ADP", "AUX", "CCONJ", "SCONJ", "PART", "INTJ", "SYM"}
    # Common auxiliary lemmas to drop even if tagged VERB
    AUX_LEMMAS = {"sein", "haben", "werden"}

    print(f"▶️  Processing {len(data)} entries from '{input_file_path}'...")

    for entry in data:
        original_word = entry.get("word", "").strip()
        if not original_word:
            continue

        translation = entry.get("translation", "")

        # Use regex to find and extract an article (e.g., ", die")
        article_match = re.search(r',\s*(die|der|das)$', original_word, re.IGNORECASE)
        article = article_match.group(1).lower() if article_match else None

        # Clean the word for NLP processing by removing articles, reflexive
        # pronouns like (sich), or other parenthetical text.
        # e.g., "(sich) vorstellen" -> "vorstellen"
        # e.g., "Möglichkeit, die" -> "Möglichkeit"
        cleaned_word = re.sub(r'\(sich\)\s*|\(.*\)|,\s*(die|der|das)$', '', original_word, flags=re.IGNORECASE).strip()
        if not cleaned_word:
            continue

        # Process the cleaned word with spacy
        doc = nlp(cleaned_word)
        if not doc or not doc[0].text.strip():
            continue
        token = doc[0]

        # Filter out entries based on multiple conditions
        lemma = token.lemma_.lower()
        pos = token.pos_
        if (
            # token.is_stop or      # Is it a spacy-defined stop word (like 'ein')?
            token.is_punct or     # Is it punctuation?
            token.is_digit or     # Is it a number?
            lemma in custom_stop_words or # Is the base form in our custom list?
            len(lemma) <= 2       # Is the base form too short?
        ):
            removed_words.append(lemma)
            continue

        # Drop function POS
        if pos in FUNCTION_POS:
            removed_words.append(lemma)
            continue

        # Drop spaCy stopwords that are not content POS
        if token.is_stop and pos not in CONTENT_POS:
            removed_words.append(lemma)
            continue

        # Drop common auxiliaries even when tagged as VERB
        if lemma in AUX_LEMMAS:
            removed_words.append(lemma)
            continue

        # Create the new, structured entry
        processed_entry = {
            "word": token.lemma_,
            "translation": translation,
            "article": article
        }
        processed_data.append(processed_entry)

    # Write the processed data to the specified output file
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, ensure_ascii=False, indent=4)
        with open("removed_words.json", 'w', encoding='utf-8') as f:
            json.dump(removed_words, f, ensure_ascii=False, indent=4)
        print(f"✅ Success! {len(processed_data)} words were processed and saved to '{output_file_path}'")
    except IOError:
        print(f"❌ Error: Could not write to the output file at '{output_file_path}'")

if __name__ == "__main__":
    # Allows you to specify filenames from the command line.
    # Example: python process_words.py my_words.json cleaned_words.json
    if len(sys.argv) < 3:
        print("Usage: python process_words.py <input_filename> <output_filename>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    process_german_words(input_file, output_file)