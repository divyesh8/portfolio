import { Activity, Boxes, Cloud, Code2 } from "lucide-react";
import { TOPOLOGY_NODES } from "@/constants/content";

const icons = [Code2, Boxes, Cloud, Activity];
export function Topology() {
  return (
    <div className="domain-index" data-motion-scene>
      <h3 className="folio-label">From code to cloud</h3>
      <ol>{TOPOLOGY_NODES.map((node, i) => {
        const Icon = icons[i];
        return <li key={node.id}><span className="domain-no">{node.step}</span><div><h4>{node.label}</h4><p>{node.detail}</p></div><Icon aria-hidden size={16} strokeWidth={1.4} /></li>;
      })}</ol>
    </div>
  );
}
