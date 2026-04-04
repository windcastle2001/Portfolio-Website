import pdfplumber
import os

path = r'C:/Users/취업하자/Desktop/이직용 포폴 사이트/이직 포트폴리오 관련 자료/기타 자료들'
pdfs = [f for f in os.listdir(path) if f.endswith('.pdf')]
output_file = 'PDF_RESEARCH_RESULTS.md'

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("# PDF Research Results\n\n")
    for filename in pdfs:
        full_path = os.path.join(path, filename)
        try:
            with pdfplumber.open(full_path) as pdf:
                out.write(f"## {filename}\n")
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if text:
                        out.write(f"### Page {i+1}\n")
                        out.write(text + "\n\n")
                    else:
                        out.write(f"### Page {i+1} (No text found or Image-based)\n\n")
                out.write("\n---\n\n")
        except Exception as e:
            out.write(f"## ERROR: {filename}\n{str(e)}\n\n")

print(f"Extraction complete. Results saved to {output_file}")
