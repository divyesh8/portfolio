"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { SITE } from "@/constants/site";

export function Resume() {
  const [preview, setPreview] = useState(false);
  return (
    <section id="resume" className="section-band">
      <div className="shell section-block">
        <div className="resume-row">
          <SectionHeading
            eyebrow="06 / Curriculum Vitae"
            title="Résumé"
            lede="Education, technical skills, and featured engineering systems consolidated into a single-page PDF."
          />
          <div className="resume-actions">
            <Button asChild size="lg">
              <a href={SITE.resumePath} download>
                <Download /> Download PDF
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              aria-controls="resume-preview"
              aria-expanded={preview}
              onClick={() => setPreview(!preview)}
            >
              <FileText size={16} />
              {preview ? "Close preview" : "Preview résumé"}
            </Button>
          </div>
        </div>
        <dl className="resume-meta-strip">
          <div>
            <dt className="eyebrow">Candidate</dt>
            <dd>{SITE.name}</dd>
          </div>
          <div>
            <dt className="eyebrow">Degree & Specialization</dt>
            <dd>
              {SITE.education} ({SITE.specialization})
            </dd>
          </div>
          <div>
            <dt className="eyebrow">University</dt>
            <dd>
              {SITE.campus} · {SITE.studyPeriod}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Focus</dt>
            <dd>{SITE.careerPath}</dd>
          </div>
        </dl>
        <div id="resume-preview" hidden={!preview}>
          {preview && (
            <div className="resume-preview">
              <div className="resume-preview-bar">
                <span className="eyebrow">Divyesh-Kolli-Resume.pdf</span>
                <a
                  className="text-link"
                  href={SITE.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open PDF in a new tab <ExternalLink size={14} />
                </a>
              </div>
              <object
                data={SITE.resumePath}
                type="application/pdf"
                aria-label="Résumé PDF preview"
              >
                <a href={SITE.resumePath} className="text-link">
                  Open the résumé PDF
                </a>
              </object>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
