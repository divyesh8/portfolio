import type { CSSProperties } from "react";

/** All rows have the same height. The widest role determines the slot width. */
export function TypingText({ words }: { words: readonly string[] }) {
  if (!words.length) return null;
  const timing = {
    "--role-cycle": `${words.length * 3}s`,
    "--role-step": `steps(${words.length}, end)`,
  } as CSSProperties;
  return (
    <span className="changing-role" data-motion-scene style={timing}>
      <span className="sr-only">{words.join(", ")}</span>
      <span className="role-window" aria-hidden="true">
        <span className="role-fade">
          <span className="role-strip">
            {words.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </span>
        </span>
      </span>
    </span>
  );
}
