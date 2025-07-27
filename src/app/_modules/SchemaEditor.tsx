"use client";
import EditorActions from "@/components/EditorActions";
import { motion } from "framer-motion";

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
}

export default function SchemaEditor({
  expand,
  setExpand,
  labMode,
  setLabMode,
  schemas,
}: SchemaEditorProps) {
  const handleLabToggle = () => setLabMode(!labMode);

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
          />
          <pre className="resize-none border-none outline-none rounded-lg font-mono text-sm p-4 text-code-light dark:text-code-dark h-full overflow-scroll hide-scrollbar w-full">
            {JSON.stringify(schemas, null, 2)}
          </pre>
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
