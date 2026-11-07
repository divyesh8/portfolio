import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { SKILL_GROUPS } from "@/constants/content";

export function Skills() {
  return (
    <section id="skills" className="shell section-block">
      <SectionHeading
        eyebrow="03 / Stack & Foundations"
        title="Technical skills"
        lede="Languages, backend frameworks, cloud infrastructure, and computer science fundamentals used across my software and reliability projects."
      />
      <Reveal>
        <dl className="skill-list">
          {SKILL_GROUPS.map((group, index) => (
            <div key={group.title} className="skill-row">
              <dt>
                <span className="skill-index" aria-hidden>
                  0{index + 1}
                </span>
                <span>{group.title}</span>
              </dt>
              <dd>
                <ul className="skill-tags" aria-label={`${group.title} skills`}>
                  {group.items.map((item) => (
                    <li key={item}>
                      <Badge className="skill-badge">{item}</Badge>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
