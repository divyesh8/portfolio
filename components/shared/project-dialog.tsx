"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, Github, X } from "lucide-react";
import { PROJECT_OVERRIDES } from "@/constants/content";

export function ProjectDialog({
  slug,
  onClose,
}: {
  slug: string | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const project = slug ? PROJECT_OVERRIDES[slug] : null;

  useEffect(() => {
    if (!project) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="project-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
      >
        <div className="dialog-heading">
          <span className="eyebrow">
            {project.kind} / {project.year}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Close project"
          >
            <X size={18} />
          </button>
        </div>

        {project.image && (
          <div className="dialog-media">
            <span
              className="media-image loaded"
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <img
                src={project.image.src}
                alt={project.title}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </span>
          </div>
        )}

        <div className="dialog-description">
          <div>
            <h2 id="dialog-title">{project.title}</h2>
            <span className="accent">{project.status}</span>
            <p>{project.description}</p>
            {project.architecture && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: "1.7",
                }}
              >
                <strong style={{ color: "var(--ink)" }}>Architecture: </strong>
                {project.architecture}
              </p>
            )}
            {project.stack && project.stack.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  marginTop: "14px",
                }}
              >
                {project.stack.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #33262a",
                      fontSize: "10px",
                      color: "var(--ink)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {project.repo && (
              <a
                className="outline-button"
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={15} /> Source code
              </a>
            )}
            {project.href && (
              <a
                className="solid-button"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: "44px", padding: "10px 18px" }}
              >
                Live demo <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

