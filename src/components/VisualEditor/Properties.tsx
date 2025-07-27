"use client";
import { motion } from "framer-motion";
import Actions from "./Actions";
import Property from "./Property";

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

type PropertiesProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  name: string;
  schema: JsonSchema;
  path: string;
};

export default function Properties({
  schemas,
  setSchemas,
  name,
  schema,
  path,
}: PropertiesProps) {
  const objectSchema = schema.type === "array" ? schema.items : schema;

  return (
    <div
      className={`absolute z-10 w-full h-full rounded-lg property-parent left-0 pt-1`}
    >
      <motion.div
        layout
        className={`property-child absolute delay-300 left-72 -translate-x-12 pl-12 opacity-0 transition-all pointer-events-none -translate-y-40 min-h-64 flex flex-col justify-end `}
      >
        <div className="flex flex-col gap-2">
          <p className="text-dimmed-light dark:text-dimmed-dark text-base pl-2">
            {name}
          </p>
          <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative actions-parent">
            <Actions
              schemas={schemas}
              setSchemas={setSchemas}
              name={name}
              schema={schema}
              path={path}
              add={true}
            />

            {objectSchema?.properties ? (
              Object.entries(objectSchema.properties).map(
                ([childName, childSchema]) => (
                  <div
                    key={childName}
                    className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
                  >
                    <p className="opacity-90">{childName}</p>
                    <p className="text-muted-light dark:text-muted-dark">
                      {childSchema.$comment
                        ? `id · ${childSchema.type.substring(0, 3)}`
                        : childSchema.type}
                    </p>
                    <Property
                      schemas={schemas}
                      setSchemas={setSchemas}
                      name={childName}
                      schema={childSchema}
                      path={buildPath(path, schema.type, childName)}
                      objectSchema={objectSchema}
                      parentName={name}
                    />
                    {/* <div
                  className={`absolute left-64 p-2 rounded-md transition-all hover:bg-surface-dark  ${
                    childSchema.$comment
                      ? "text-accent-light/80 dark:text-accent-dark/80 hover:text-accent-light dark:hover:text-accent-dark"
                      : objectSchema.required?.find((r) => r == childName)
                      ? " text-accent-primary/60 dark:text-primary-dark/60 hover:text-primary-light dark:hover:text-primary-dark"
                      : " text-dimmed-light dark:text-dimmed-dark hover:text-text-light dark:hover:text-text-dark"
                  }`}
                  onClick={() =>
                    toggleRequired({
                      db: dbName,
                      property: propName,
                      schemas,
                      setSchemas,
                    })
                  }
                >
                  <Asterisk size={16} />
                </div> */}
                  </div>
                )
              )
            ) : (
              <p className="text-gray-400 italic">No properties defined</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function buildPath(parentPath: string, type: string, key: string) {
  return `${parentPath}.${
    type === "array" ? "items.properties" : "properties"
  }.${key}`;
}
