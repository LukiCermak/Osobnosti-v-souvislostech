import re
import zipfile
from pathlib import Path

docx_path = Path("../Mini-wikipedie osobností vs.docx")
if not docx_path.exists():
    docx_path = Path("Mini-wikipedie osobností vs.docx")

if not docx_path.exists():
    raise SystemExit("Nenalezen soubor Mini-wikipedie osobností vs.docx")

with zipfile.ZipFile(docx_path) as z:
    xml = z.read("word/document.xml").decode("utf-8", errors="ignore")

text = re.sub(r"<[^>]+>", "\n", xml)
text = re.sub(r"\n+", "\n", text)

# hrubé hledání řádků typu "Jméno (1900-1980)" nebo "Jméno (asi ...)"
candidate_lines = []
for line in text.splitlines():
    line = line.strip()
    if not line:
        continue
    if "(" in line and ")" in line and len(line) < 120:
        if re.search(r"\d{3,4}", line):
            candidate_lines.append(line)

# deduplikace při zachování pořadí
seen = set()
result = []
for line in candidate_lines:
    if line not in seen:
        seen.add(line)
        result.append(line)

out = Path("content/source/mini-wikipedie-osobnosti/_inventory_person_lines.txt")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("\n".join(result), encoding="utf-8")

print(f"Hotovo. Uloženo {len(result)} kandidátních řádků do {out}")
