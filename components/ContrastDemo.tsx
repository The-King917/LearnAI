import Reveal from "./Reveal";
import { CheckIcon } from "./icons";

const QUESTION = "How do I count arrangements of AABBCC?";

export default function ContrastDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Reveal y={24}>
        <div className="rounded-2xl border border-border-2 bg-surface overflow-hidden h-full">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#555]" />
            <span className="text-2xs text-text-2">A typical AI chatbot</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-end">
              <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%] leading-relaxed">
                {QUESTION}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-md bg-[#333] shrink-0 mt-0.5" />
              <div className="text-xs text-text-2 leading-relaxed">
                Group the identical letters: 6! / (2! · 2! · 2!) = 90. There are <strong className="text-text font-medium">90 arrangements</strong>.
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal y={24} delay={0.1}>
        <div className="rounded-2xl border border-accent/25 bg-surface overflow-hidden h-full shadow-card">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-2xs text-accent font-medium">PolyTeach</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-end">
              <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%] leading-relaxed">
                {QUESTION}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <CheckIcon />
              </div>
              <div className="text-xs text-text-2 leading-relaxed">If all 6 letters were distinct, how many arrangements would there be?</div>
            </div>
            <div className="flex justify-end">
              <div className="px-3 py-2 rounded-xl rounded-br-sm bg-surface-2 border border-border-2 text-xs text-text max-w-[85%]">6! = 720</div>
            </div>
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <CheckIcon />
              </div>
              <div className="text-xs text-text-2 leading-relaxed">Good. Now the two A&apos;s are identical — how does that change the count?</div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
