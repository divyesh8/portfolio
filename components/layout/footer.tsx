import { ArrowUp, Github, Instagram, Linkedin } from "lucide-react";
import { XIcon } from "@/components/ui/x-icon";
import { SITE, SOCIALS } from "@/constants/site";

const links = [
  { name: "GitHub", href: SOCIALS.github, Icon: Github },
  { name: "LinkedIn", href: SOCIALS.linkedin, Icon: Linkedin },
  { name: "X", href: SOCIALS.x, Icon: XIcon },
  { name: "Instagram", href: SOCIALS.instagram, Icon: Instagram },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden>
            {SITE.initials}
            <i>.</i>
          </span>
          <div>
            <p className="footer-name">
              © {new Date().getFullYear()} {SITE.name}
            </p>
            <p className="footer-meta">
              {SITE.role} · {SITE.location}
            </p>
          </div>
        </div>
        <ul>
          {links.map(({ name, href, Icon }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="icon-control"
              >
                <Icon size={17} />
              </a>
            </li>
          ))}
        </ul>
        <a href="#hero" className="text-link">
          Back to top <ArrowUp size={15} />
        </a>
      </div>
    </footer>
  );
}
