import type { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Hint } from "@workspace/ui/components/hint";
import { ArrowRight, ArrowUp, Check } from "lucide-react";

type ConversationStatusButtonProps = {
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled?: boolean;
};

export default function ConversationStatusButton({
  status,
  onClick,
  disabled,
}: ConversationStatusButtonProps) {
  if (status === "resolved") {
    return (
      <Hint text="Mark as unresolved">
        <Button
          size="sm"
          variant="success"
          onClick={onClick}
          disabled={disabled}
        >
          <Check />
          Resolved
        </Button>
      </Hint>
    );
  }

  if (status === "escalated") {
    return (
      <Hint text="Mark as resolved">
        <Button
          size="sm"
          variant="warning"
          onClick={onClick}
          disabled={disabled}
        >
          <ArrowUp />
          Escalated
        </Button>
      </Hint>
    );
  }

  if (status === "unresolved") {
    return (
      <Hint text="Mark as escalated">
        <Button
          size="sm"
          variant="danger"
          onClick={onClick}
          disabled={disabled}
        >
          <ArrowRight />
          Unresolved
        </Button>
      </Hint>
    );
  }
}
