"use client";
import EditorActions from "@/components/EditorActions";
import Database from "@/components/VisualEditor/Database";
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

type EditorProps = {
  schemas: Record<string, JsonSchema>;
  expand: boolean;
  setExpand: (value: boolean) => void;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  refreshSchemas: () => void;
};

export default function VisualEditor({
  schemas,
  expand,
  setExpand,
  setSchemas,
  refreshSchemas,
}: EditorProps) {
  return (
    <motion.div
      layout
      className={`h-full overflow-hidden p-4 border-l border-border-light dark:border-border-dark flex flex-col relative bg-bg-light dark:bg-bg-dark z-30 select-none group ${
        expand ? "w-full" : "w-2/3"
      }`}
    >
      <div className="h-full w-full relative group">
      <EditorActions
        expand={expand}
        setExpand={setExpand}
        simple={true}
        refreshSchemas={refreshSchemas}
      />
      <div className="w-full h-full overflow-scroll hide-scrollbar flex flex-col gap-8 p-4 ">
        {Object.entries(schemas).map(([dbName, schema]) => (
          <Database
            key={dbName}
            schemas={schemas}
            setSchemas={setSchemas}
            name={dbName}
            schema={schema}
            path={dbName}
          />
        ))}
      </div>
      </div>
    </motion.div>
  );
}
