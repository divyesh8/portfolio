import Image from "next/image";
import type { Project } from "@/constants/content";

const covers: Record<string, { src: string; series: string; tag: string }> = {
  aegisops: { src: "/art/cover-aegisops.svg", series: "Signal studies", tag: "Reliability" },
  clouddoctor: { src: "/art/cover-clouddoctor.svg", series: "Config studies", tag: "CLI / Static analysis" },
  nimbus: { src: "/art/cover-nimbus.svg", series: "Storage studies", tag: "Distributed systems" },
};

export function ProjectPreview({ project, index }: { project: Project; index: number }) {
  if (!project.image) return null;
  const cover = covers[project.slug];
  const folio = String(index + 1).padStart(2, "0");
  return (
    <div className={`project-cover cover-${project.slug}`} aria-hidden="true">
      {cover ? (
        <>
          <Image src={cover.src} width={600} height={360} alt="" unoptimized className="cover-art" />
          <span className="cover-series">{cover.series} <i>/ {folio}</i></span>
          <div className="cover-imprint"><span>{cover.tag}</span><b>{project.title}</b></div>
          <span className="cover-register">Fig. {folio}</span>
        </>
      ) : (
        <Image src={project.image.src} width={1200} height={660} alt="" sizes="(max-width: 700px) 92vw, (max-width: 1020px) 45vw, 32vw" className="cover-art" />
      )}
    </div>
  );
}
