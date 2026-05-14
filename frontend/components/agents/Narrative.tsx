import type { Mention as MentionTarget } from "@/types/api";
import { Mention } from "./Mention";

type Props = { text: string; mention?: MentionTarget };

// Renders the agent / analyst narrative paragraph. If a mention is set,
// strip the leading @mention token from the text and render the mention
// pill in front.
export function Narrative({ text, mention }: Props) {
  const stripped = mention ? text.replace(/^@\w+(\.\w+)?\s*/, "") : text;
  return (
    <div className="text-[13px] text-ink leading-[1.55]">
      {mention && (
        <>
          <Mention target={mention} />{" "}
        </>
      )}
      {stripped}
    </div>
  );
}
