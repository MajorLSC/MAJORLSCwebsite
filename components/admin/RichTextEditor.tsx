"use client";

import { useRef } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function emitChange() {
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  }

  function exec(command: string) {
    ref.current?.focus();

    document.execCommand(command, false);

    // Normalize lists so the generated email HTML has
    // predictable alignment/spacing in email clients.
    if (command === "insertUnorderedList" && ref.current) {
      ref.current.querySelectorAll("ul").forEach((ul) => {
        ul.setAttribute(
          "style",
          [
            "margin: 8px 0",
            "padding-left: 24px",
            "margin-left: 0",
            "text-align: left",
            "direction: ltr",
          ].join("; ")
        );

        ul.querySelectorAll("li").forEach((li) => {
          li.setAttribute(
            "style",
            "margin: 2px 0; padding-left: 2px; text-align: left; direction: ltr;"
          );
        });
      });
    }

    emitChange();
  }

  return (
    <div className="rte">
      <div
        className="rte__toolbar"
        role="toolbar"
        aria-label="Formatting"
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          aria-label="Bold"
        >
          <b>B</b>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          aria-label="Italic"
        >
          <i>I</i>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          aria-label="Bullet list"
        >
          &bull;
        </button>
      </div>

      <div
        ref={ref}
        className="rte__area"
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        aria-label="Email body"
        dir="ltr"
      />
    </div>
  );
}
