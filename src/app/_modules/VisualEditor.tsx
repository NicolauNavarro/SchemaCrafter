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
          <div
            onClick={() =>
              addNewDatabase({
                schemas,
                setSchemas,
              })
            }
            className="mt-4 w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative actions-parent items-center justify-center hover:bg-border-light dark:hover:bg-border-dark transition-all cursor-pointer text-dimmed-light dark:text-dimmed-dark hover:text-text-light dark:hover:text-text-dark"
          >
            <p>Create new DB</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

type NewDBProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

function addNewDatabase({ schemas, setSchemas }: NewDBProps) {
  const baseName = "new_DB";
  let dbName = baseName;
  let counter = 1;

  while (schemas.hasOwnProperty(dbName)) {
    dbName = `${baseName}_${counter}`;
    counter++;
  }

  const newSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        property_name: {
          type: "string",
        },
      },
      required: ["property_name"],
    },
  };

  const updatedSchemas = {
    ...schemas,
    [dbName]: newSchema,
  };

  setSchemas(updatedSchemas);
}
