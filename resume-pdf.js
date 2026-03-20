"use strict";

function getTextContent(selector, root) {
  const scope = root || document;
  return scope.querySelector(selector)?.textContent?.trim() || "";
}

function normalizeContactValue(href) {
  if (!href) {
    return "";
  }

  if (href.startsWith("mailto:")) {
    return href.replace("mailto:", "");
  }

  if (href.startsWith("tel:")) {
    return href.replace("tel:", "");
  }

  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function normalizeWhitespace(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function collectResumeData() {
  const experienceEntries = Array.from(
    document.querySelectorAll('.resume-container > .resume-card:nth-of-type(5) .resume-entry')
  ).map((entry) => {
    const titleNode = entry.querySelector("h3, h4");
    const roleTitle = normalizeWhitespace(titleNode?.textContent || "");
    const companyGroup = entry.closest(".resume-company-group");
    const companyName = companyGroup
      ? getTextContent(".resume-company-name", companyGroup)
      : "";
    const title = companyName && roleTitle && !roleTitle.toLowerCase().includes(companyName.toLowerCase())
      ? `${roleTitle}, ${companyName}`
      : roleTitle;

    return {
      title,
      meta: getTextContent(".resume-entry-meta", entry),
      bullets: Array.from(entry.querySelectorAll("li"))
        .slice(0, 3)
        .map((item) => normalizeWhitespace(item.textContent || ""))
        .filter(Boolean),
    };
  }).filter((entry) => entry.title);

  const highlightBullets = Array.from(
    document.querySelectorAll(".resume-highlights-list li")
  )
    .slice(0, 4)
    .map((item) => item.textContent.trim());

  const educationBullets = Array.from(
    document.querySelectorAll(".resume-education-block .resume-list li")
  )
    .slice(0, 2)
    .map((item) => item.textContent.trim());

  const certifications = Array.from(
    document.querySelectorAll(".resume-certifications-block > .resume-list > li")
  )
    .slice(0, 4)
    .map((item) => item.getAttribute("data-cert-title") || normalizeWhitespace(item.textContent));

  return {
    name: getTextContent(".resume-header h1"),
    role: getTextContent(".resume-role"),
    location: getTextContent(".resume-location"),
    summary: normalizeWhitespace(getTextContent(".resume-container > .resume-card:nth-of-type(2) p")),
    skills: Array.from(document.querySelectorAll(".resume-skill"))
      .slice(0, 12)
      .map((skill) => skill.textContent.trim()),
    contact: {
      email: normalizeContactValue(
        document.querySelector(".resume-meta-primary a[href^='mailto:']")?.getAttribute("href")
      ),
      phone: normalizeContactValue(
        document.querySelector(".resume-meta-primary a[href^='tel:']")?.getAttribute("href")
      ),
      linkedin: normalizeContactValue(
        document.querySelector(".resume-meta-social a[href*='linkedin.com']")?.getAttribute("href")
      ),
      github: normalizeContactValue(
        document.querySelector(".resume-meta-social a[href*='github.com']")?.getAttribute("href")
      ),
    },
    highlights: highlightBullets,
    experience: experienceEntries,
    education: {
      title: getTextContent(".resume-education-block h3"),
      meta: getTextContent(".resume-education-block .resume-entry-meta"),
      bullets: educationBullets,
    },
    certifications,
  };
}

function drawWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text || "", maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function getWrappedHeight(doc, text, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text || "", maxWidth);
  return lines.length * lineHeight;
}

function drawSectionTitle(doc, title, x, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title.toUpperCase(), x, y);
  return y + 20;
}

function canFit(y, pageBottom, neededSpace) {
  return y + neededSpace <= pageBottom;
}

function exportResumePdf() {
  if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
    window.alert("PDF export is unavailable right now. Please refresh and try again.");
    return;
  }

  const data = collectResumeData();
  const jsPDFCtor = window.jspdf.jsPDF;
  const doc = new jsPDFCtor({ unit: "pt", format: "letter", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30;
  const topPadding = 64;
  const contentWidth = pageWidth - margin * 2;
  const pageBottom = pageHeight - 40;
  const sectionGap = 22;
  let y = topPadding;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setTextColor(22, 22, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(data.name || "Austin Wells", margin, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12.5);
  const subhead = [data.role, data.location].filter(Boolean).join(" | ");
  doc.text(subhead, margin, y);
  y += 16;

  doc.setFontSize(10.5);
  const contacts = [data.contact.email, data.contact.phone, data.contact.linkedin, data.contact.github]
    .filter(Boolean)
    .join("  |  ");
  const contactLines = doc.splitTextToSize(contacts, contentWidth);
  doc.text(contactLines, margin, y);
  y += contactLines.length * 13;

  doc.setDrawColor(150);
  doc.setLineWidth(0.7);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 26;

  y = drawSectionTitle(doc, "Summary", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.2);
  y = drawWrappedText(doc, data.summary, margin, y, contentWidth, 13.4);
  y += sectionGap;

  y = drawSectionTitle(doc, "Skills", margin, y);
  doc.setFontSize(10);
  y = drawWrappedText(doc, data.skills.join(" • "), margin, y, contentWidth, 12.2);
  y += sectionGap;

  if (data.highlights.length && canFit(y, pageBottom, 58)) {
    y = drawSectionTitle(doc, "Highlights", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.6);
    data.highlights.forEach((bullet) => {
      const bulletText = "• " + bullet;
      const bulletHeight = getWrappedHeight(doc, bulletText, contentWidth, 12.2);
      if (!canFit(y, pageBottom, bulletHeight + 2)) {
        return;
      }
      y = drawWrappedText(doc, bulletText, margin, y, contentWidth, 12.2);
    });
    y += sectionGap;
  }

  y = drawSectionTitle(doc, "Experience", margin, y);
  data.experience.forEach((entry) => {
    if (!canFit(y, pageBottom, 84)) {
      return;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.2);
    y = drawWrappedText(doc, entry.title, margin, y, contentWidth, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    y = drawWrappedText(doc, entry.meta, margin, y, contentWidth, 12);

    doc.setFontSize(9);
    entry.bullets.forEach((bullet) => {
      const bulletText = "• " + bullet;
      const bulletHeight = getWrappedHeight(doc, bulletText, contentWidth, 12.2);
      if (!canFit(y, pageBottom, bulletHeight + 2)) {
        return;
      }
      y = drawWrappedText(doc, bulletText, margin, y, contentWidth, 12.2);
    });

    y += 12;
  });

  if (canFit(y, pageBottom, 56)) {
    y += 16;
    y = drawSectionTitle(doc, "Education", margin, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.2);
    y = drawWrappedText(doc, data.education.title, margin, y, contentWidth, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    y = drawWrappedText(doc, data.education.meta, margin, y, contentWidth, 10.8);

    doc.setFontSize(9);
    data.education.bullets.forEach((bullet) => {
      const bulletText = "• " + bullet;
      const bulletHeight = getWrappedHeight(doc, bulletText, contentWidth, 12.2);
      if (!canFit(y, pageBottom, bulletHeight + 2)) {
        return;
      }
      y = drawWrappedText(doc, bulletText, margin, y, contentWidth, 12.2);
    });

    const certificationText = data.certifications.join(" • ");
    const certificationHeight = getWrappedHeight(doc, certificationText, contentWidth, 10.8);
    const certificationBlockHeight = 5 + 11 + certificationHeight + 2;

    if (data.certifications.length && canFit(y, pageBottom, certificationBlockHeight)) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.6);
      doc.text("Certifications:", margin, y);
      y += 11;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      y = drawWrappedText(
        doc,
        certificationText,
        margin,
        y,
        contentWidth,
        10.8
      );
    }
  }

  try {
    doc.save("Austin_Wells_Resume.pdf");
  } catch (error) {
    console.error("PDF export failed.", error);
    window.alert("PDF export failed. Please try again in a moment.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("resume-pdf-download");
  if (!trigger) {
    return;
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    exportResumePdf();
  });
});
