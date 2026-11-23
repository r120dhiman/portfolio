#!/usr/bin/env python3
"""
Build the one-page LaTeX resumes into public/cv/.

Each resume/Rohit_Kumar_*.tex has a fixed core plus optional blocks:

    %% optional: <priority> <name>
    ...lines...
    %% end optional

Optional blocks are tried by priority (1 = most valuable first), wherever they sit on the page. A block is kept
only if the resume still compiles to exactly ONE page with no line overflowing the
frame. So the page fills with real content first; the stretch glue in rkresume.sty
then absorbs the small remainder, leaving no white gap at the bottom.

Usage: npm run resume
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "public" / "cv"
START = re.compile(r"^\s*%%\s*optional:\s*(.+?)\s*$")
END = re.compile(r"^\s*%%\s*end optional\s*$")


def parse(text: str) -> list[tuple[str | None, str]]:
    """Split into [(None, core text) | (name, optional text)] in order."""
    parts: list[tuple[str | None, str]] = []
    buf: list[str] = []
    name: str | None = None
    for line in text.splitlines(keepends=True):
        m = START.match(line)
        if m:
            if name is not None:
                sys.exit(f"nested optional block '{m.group(1)}'")
            parts.append((None, "".join(buf)))
            buf, name = [], m.group(1)
            continue
        if END.match(line):
            if name is None:
                sys.exit("'%% end optional' without a start")
            parts.append((name, "".join(buf)))
            buf, name = [], None
            continue
        buf.append(line)
    if name is not None:
        sys.exit(f"optional block '{name}' is not closed")
    parts.append((None, "".join(buf)))
    return parts


def render(parts, keep: set[str]) -> str:
    return "".join(t for n, t in parts if n is None or n in keep)


def compile_tex(src: str, stem: str, workdir: Path) -> tuple[bool, str, Path]:
    """Compile; return (fits_one_page_cleanly, reason, pdf_path)."""
    tex = workdir / f"{stem}.tex"
    tex.write_text(src)
    proc = subprocess.run(
        ["tectonic", "--keep-logs", "--outdir", str(workdir), str(tex)],
        cwd=HERE, capture_output=True, text=True,
    )
    if proc.returncode != 0:
        sys.exit(f"LaTeX error in {stem}:\n{proc.stderr[-3000:]}")
    log = (workdir / f"{stem}.log").read_text(errors="ignore")
    pages = re.findall(r"Output written on .*?\((\d+) page", log)
    n = int(pages[-1]) if pages else 0
    if n != 1:
        return False, f"{n} pages", workdir / f"{stem}.pdf"
    over = [float(x) for x in re.findall(r"Overfull \\hbox \(([\d.]+)pt too wide", log)]
    if any(x > 1.0 for x in over):
        return False, f"line overflows by {max(over):.1f}pt", workdir / f"{stem}.pdf"
    if "Overfull \\vbox" in log:
        return False, "page overflows", workdir / f"{stem}.pdf"
    return True, "ok", workdir / f"{stem}.pdf"


# ---------------------------------------------------------------- ATS check
MONTHS = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}"
HEADINGS = ["EDUCATION", "SKILLS", "EXPERIENCE", "PROJECTS"]


def pdf_text(pdf: Path) -> str:
    """Text as a parser sees it (macOS PDFKit via resume/pdftext.swift)."""
    out = subprocess.run(["swift", str(HERE / "pdftext.swift"), str(pdf)], capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(f"text extraction failed: {out.stderr}")
    return out.stdout


def ats_check(pdf: Path) -> list[str]:
    text = pdf_text(pdf)
    problems: list[str] = []
    if "PAGES=1" not in text.splitlines()[0]:
        problems.append("not exactly one page")
    body = text.split("\n", 1)[1] if "\n" in text else ""
    if len(body) < 2000:
        problems.append(f"only {len(body)} characters of extractable text (scanned/image PDF?)")
    lines = [l.strip() for l in body.splitlines()]
    if not lines or lines[0] != "ROHIT KUMAR":
        problems.append("name is not the first line")
    head = "\n".join(lines[:3])
    for needle, what in [("@", "email"), ("linkedin.com/in/", "LinkedIn URL"), ("github.com/", "GitHub URL")]:
        if needle not in head:
            problems.append(f"{what} missing from the top of the page")
    pos = [body.find("\n" + h + "\n") for h in HEADINGS]
    for h, i in zip(HEADINGS, pos):
        if i < 0:
            problems.append(f"standard heading '{h}' not found as its own line")
    if all(i >= 0 for i in pos) and pos != sorted(pos):
        problems.append("standard headings are out of order")
    if re.search(r"[A-Za-z]-\n[a-z]", body):
        problems.append("a word is hyphenated across lines: " + re.search(r"\S+-\n\S+", body).group(0).replace("\n", ""))
    bad = sorted({c for c in body if 0xFB00 <= ord(c) <= 0xFB06 or 0xE000 <= ord(c) <= 0xF8FF or c in "\ufffd→←⇒"})
    if bad:
        problems.append("unparseable glyphs: " + " ".join(f"U+{ord(c):04X}" for c in bad))
    if len(re.findall(MONTHS, body)) < 2:
        problems.append("dates are not in 'Mon YYYY' form")
    return problems


def build(path: Path) -> bool:
    stem = path.stem
    parts = parse(path.read_text())
    def prio(n: str) -> tuple[int, str]:
        m = re.match(r"(\d+)\s+", n)
        return (int(m.group(1)) if m else 99, n)

    optional = sorted((n for n, _ in parts if n is not None), key=prio)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        shutil.copy(HERE / "rkresume.sty", work / "rkresume.sty")
        ok, why, pdf = compile_tex(render(parts, set()), stem, work)
        if not ok:
            print(f"✗ {stem}: core alone does not fit ({why}) — trim the core")
            return False
        keep: set[str] = set()
        best = pdf.read_bytes()
        for name in optional:
            trial = keep | {name}
            ok, why, pdf = compile_tex(render(parts, trial), stem, work)
            if ok:
                keep, best = trial, pdf.read_bytes()
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / f"{stem}.pdf").write_bytes(best)
    problems = ats_check(OUT / f"{stem}.pdf")
    if problems:
        print(f"✗ {stem}.pdf fails the ATS check:\n  - " + "\n  - ".join(problems))
        return False
    dropped = [n for n in optional if n not in keep]
    print(f"✓ {stem}.pdf — 1 page · ATS ok · added: {', '.join(re.sub(r"^\d+\s+", "", n) for n in optional if n in keep) or 'none'}"
          + (f" · left out (no room): {', '.join(re.sub(r"^\d+\s+", "", n) for n in dropped)}" if dropped else ""))
    return True


if __name__ == "__main__":
    files = sorted(HERE.glob("Rohit_Kumar_*.tex"))
    results = [build(f) for f in files]
    sys.exit(0 if all(results) else 1)
