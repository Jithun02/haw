from __future__ import annotations

from io import BytesIO, StringIO
import csv

import pandas as pd


def export_csv(rows: list[dict]) -> str:
    if not rows:
        return ""
    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def export_excel_bytes(rows: list[dict]) -> bytes:
    frame = pd.DataFrame(rows)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        frame.to_excel(writer, index=False, sheet_name="Telemetry")
    return buffer.getvalue()


def export_pdf_bytes(rows: list[dict], title: str) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 48
    pdf.setTitle(title)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(40, y, title)
    y -= 30
    pdf.setFont("Helvetica", 10)
    for row in rows[:40]:
        line = ", ".join(f"{key}: {value}" for key, value in row.items())
        pdf.drawString(40, y, line[:110])
        y -= 14
        if y < 48:
            pdf.showPage()
            pdf.setFont("Helvetica", 10)
            y = height - 48
    pdf.save()
    return buffer.getvalue()
