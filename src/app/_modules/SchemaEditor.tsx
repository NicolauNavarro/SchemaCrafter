"use client";
import EditorActions from "@/components/EditorActions";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = JsonValue[];

interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  format?: string;
  $comment?: string;
}

interface SchemaEditorProps {
  expand: boolean;
  setExpand: (value: boolean) => void;
  labMode: boolean;
  setLabMode: (value: boolean) => void;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  refreshSchemas: () => void;
}

export default function SchemaEditor({
  expand,
  setExpand,
  labMode,
  setLabMode,
  schemas,
  setSchemas,
  refreshSchemas,
}: SchemaEditorProps) {
  const [rawInput, setRawInput] = useState(JSON.stringify(schemas, null, 2));

  useEffect(() => {
    // Sync raw input when schemas change externally
    setRawInput(JSON.stringify(schemas, null, 2));
  }, [schemas]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRawInput(newValue);

    try {
      const parsed = JSON.parse(newValue);
      if (!deepEqual(parsed, schemas)) {
        setSchemas(parsed);
      }
    } catch {
      // JSON invalid: do nothing
    }
  };

  const handleLabToggle = () => setLabMode(!labMode);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        rawInput.substring(0, start) + "  " + rawInput.substring(end); // 2 spaces
      setRawInput(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <motion.div
      layout
      className={`h-full overflow-hidden p-4 border-border-light dark:border-border-dark flex flex-col relative bg-bg-light dark:bg-bg-dark z-30 ${
        expand
          ? "border-none w-full"
          : labMode
          ? "border-r w-1/3"
          : "border-l w-1/2"
      }`}
    >
      {Object.keys(schemas).length > 0 ? (
        <div className="h-full w-full relative group">
          <EditorActions
            expand={expand}
            setExpand={setExpand}
            clipboard={JSON.stringify(schemas, null, 2)}
            {...(labMode && { refreshSchemas })}
          />
          {labMode ? (
            <textarea
              value={rawInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              placeholder="Write your JSON with multiple root keys (e.g., User, Post)..."
              className="resize-none border-none outline-none rounded-lg bg-surface-light dark:bg-surface-dark font-mono text-sm p-4 text-code-light dark:text-code-dark h-full w-full overflow-scroll hide-scrollbar"
            ></textarea>
          ) : (
            <pre className="resize-none border-none outline-none rounded-lg font-mono text-sm p-4 text-code-light dark:text-code-dark h-full overflow-scroll hide-scrollbar w-full">
              {JSON.stringify(schemas, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <p className="p-4">Schema is empty or invalid</p>
      )}
      {!expand && (
        <motion.button
          layout
          onClick={handleLabToggle}
          className={`absolute ${
            labMode ? "left-8" : "right-8"
          } bottom-8 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark text-dimmed-light dark:text-dimmed-dark shadow-2xl border border-border-light dark:border-border-dark cursor-pointer hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark transition-colors`}
        >
          {labMode ? "Back to JSON" : "Continue to lab"}
        </motion.button>
      )}
    </motion.div>
  );
}

function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (
    Array.isArray(a) !== Array.isArray(b) ||
    Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)
  ) {
    return false;
  }

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    const typedKey = key as keyof T;
    if (!(key in (b as object))) return false;
    if (!deepEqual(a[typedKey], b[typedKey])) return false;
  }

  return true;
}
