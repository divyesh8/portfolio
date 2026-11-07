import { ArrowUpRight, Github, Instagram, Linkedin } from "lucide-react";
import { XIcon } from "@/components/ui/x-icon";
import { SITE, SOCIALS } from "@/constants/site";

const profiles = [
  {
    name: "GitHub",
    handle: "@" + SITE.handle,
    href: SOCIALS.github,
    Icon: Github,
  },
  {
    name: "LinkedIn",
    handle: SITE.name,
    href: SOCIALS.linkedin,
    Icon: Linkedin,
  },
  {
    name: "X",
    handle: "@_divyesh8",
    href: SOCIALS.x,
    Icon: XIcon,
  },
  {
    name: "Instagram",
    handle: "@_divyesshh",
    href: SOCIALS.instagram,
    Icon: Instagram,
  },
];

export function Profiles() {
  return (
    <section id="profiles" className="shell profile-links">
      <h2 className="eyebrow">Elsewhere</h2>
      <ul>
        {profiles.map(({ name, handle, href, Icon }) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              <Icon size={17} />
              <span>
                {name}
                <small>{handle}</small>
              </span>
              <ArrowUpRight size={14} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
