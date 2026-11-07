"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
  GitFork,
  Github,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { EASE, useReducedMotionSafe } from "@/components/shared/motion";
import { ProjectPreview } from "@/components/shared/project-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PROJECT_FILTERS,
  FEATURED_SLUGS,
  type Project,
  type ProjectTag,
} from "@/constants/content";

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="case-links">
      {project.repo && (
        <Button asChild variant="primary" size="sm">
          <a href={project.repo} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> GitHub repository <ArrowUpRight size={14} />
          </a>
        </Button>
      )}
      {project.href && (
        <Button asChild variant="outline" size="sm">
          <a href={project.href} target="_blank" rel="noopener noreferrer">
            Live demo <ExternalLink size={14} />
          </a>
        </Button>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const reduced = useReducedMotionSafe();
  return (
    <Dialog.Root>
      <article
        className={project.image ? "project-card" : "project-card archive-card"}
      >
        <ProjectPreview project={project} index={index} />
        <div className="project-caption">
          <span className="project-rank" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
          <div><h3>{project.title}</h3><p>{project.kind}{project.year && <> / {project.year}</>}</p></div>
          <Dialog.Trigger asChild>
            <button type="button" className="case-trigger" aria-label={`Read ${project.title} case study`}>
              <ArrowUpRight size={19} aria-hidden />
            </button>
          </Dialog.Trigger>
        </div>
        {!project.image && project.description && <p className="archive-description">{project.description}</p>}
        {(project.repo || project.href) && <div className="project-resources">
          {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source code on GitHub`}>Source <ArrowUpRight size={12} /></a>}
          {project.href && <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live demonstration`}>Live demo <ArrowUpRight size={12} /></a>}
        </div>}
        <noscript>
          <ProjectLinks project={project} />
        </noscript>
      </article>
      <Dialog.Portal>
        <Dialog.Overlay className="case-overlay" />
        <Dialog.Content className="case-dialog" data-lenis-prevent>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: EASE }}
          >
            <div className="case-top">
              <p className="eyebrow">
                {project.kind} / {project.year}
              </p>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="icon-control"
                  aria-label="Close case study"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Title className="case-title">{project.title}</Dialog.Title>
            <Dialog.Description className="case-description">
              {project.description || project.kind}
            </Dialog.Description>
            <p className="case-status">
              <span aria-hidden />
              {project.status}
            </p>
            {project.image && (
              <figure className="case-figure">
                <Image
                  src={project.image.src}
                  width={1200}
                  height={660}
                  alt={project.image.alt}
                  sizes="(max-width: 760px) 90vw, 680px"
                />
                <figcaption>{project.image.caption}</figcaption>
              </figure>
            )}
            {project.problem && (
              <div className="case-detail">
                <h3>Problem</h3>
                <p>{project.problem}</p>
              </div>
            )}
            {project.solution && (
              <div className="case-detail">
                <h3>Solution</h3>
                <p>{project.solution}</p>
              </div>
            )}
            {project.architecture && (
              <div className="case-detail">
                <h3>Architecture</h3>
                <p>{project.architecture}</p>
              </div>
            )}
            {project.features.length > 0 && (
              <div className="case-detail">
                <h3>Key features</h3>
                <ul>
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.stack.length > 0 && (
              <div className="case-detail">
                <h3>Technologies</h3>
                <ul className="tech-tags">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Badge>{tech}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ProjectLinks project={project} />
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProjectsGallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<"all" | ProjectTag>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState(0);
  const term = query.trim().toLowerCase();
  const browsing = Boolean(term) || filter !== "all";
  const matches = projects.filter(
    (p) =>
      (filter === "all" || p.tags.includes(filter)) &&
      [
        p.title,
        p.kind,
        p.description,
        p.problem ?? "",
        p.architecture ?? "",
        ...p.stack,
        ...p.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
  );
  const featured = FEATURED_SLUGS.flatMap((slug) => projects.filter((p) => p.slug === slug));
  const shelf = featured.length ? featured : projects;
  const visible = expanded || browsing ? matches : Array.from({ length: Math.min(3, shelf.length) }, (_, i) => shelf[(i + offset) % shelf.length]);
  const filters = PROJECT_FILTERS.filter(
    (f) =>
      f.id === "all" ||
      projects.some((p) => p.tags.includes(f.id as ProjectTag)),
  );

  return (
    <>
      <div className="project-tools">
        <div
          className="filters"
          role="group"
          aria-label="Filter projects by category"
        >
          {filters.map(({ id, label }) => (
            <button
              type="button"
              key={id}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
              {filter === id && (
                <motion.span layoutId="work-filter" className="filter-line" />
              )}
            </button>
          ))}
        </div>
        <label className="project-search">
          <Search size={15} />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            placeholder="Title or technology"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="sr-only" role="status">
        {visible.length} of {projects.length} projects shown
      </p>
      <div id="project-list" className="project-grid">
        {visible.map((p) => (
          <ProjectCard key={p.slug} project={p} index={Math.max(0, projects.indexOf(p))} />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <GitFork size={22} />
          <p>
            {projects.length
              ? "No projects match this filter or search query."
              : "No public projects are available."}
          </p>
          {browsing && (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}
      {!browsing && projects.length > 3 && (
        <div className="gallery-foot">
          <button type="button" aria-expanded={expanded} aria-controls="project-list" className="archive-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Back to selected work" : `Browse project archive (${projects.length})`} <ArrowRight size={15} />
          </button>
          {!expanded && shelf.length > 3 && <div className="shelf-controls" aria-label="Featured project navigation">
            <span aria-live="polite">Selection {String(offset+1).padStart(2,"0")} / {String(shelf.length).padStart(2,"0")}</span>
            <button type="button" className="icon-control" aria-controls="project-list" aria-label="Previous featured projects" onClick={() => setOffset((n) => (n+shelf.length-1)%shelf.length)}><ChevronLeft size={16} /></button>
            <button type="button" className="icon-control" aria-controls="project-list" aria-label="Next featured projects" onClick={() => setOffset((n) => (n+1)%shelf.length)}><ChevronRight size={16} /></button>
          </div>}
        </div>
      )}
    </>
  );
}
