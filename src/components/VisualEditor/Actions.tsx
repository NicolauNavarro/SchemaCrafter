"use client";

import { motion } from "framer-motion";
import { CirclePlus, Trash } from "lucide-react";

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

type ActionsProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  schema: JsonSchema;
  path: string;
  trash?: boolean;
  add?: boolean;
};

export default function Actions({
  schemas,
  setSchemas,
  schema,
  path,
  trash,
  add,
}: ActionsProps) {
  return (
    <motion.div className="flex items-center gap-2 absolute -top-8 translate-y-2 right-0 transition-all opacity-0 z-10 select-none h-8 pl-8 pr-4 pb-1 actions-child">
      {add && (
        <div
          onClick={() =>
            addProperty({
              schemas,
              setSchemas,
              schema,
              path,
            })
          }
          className="p-1 rounded-md hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark text-dimmed-light dark:text-dimmed-dark transition-all cursor-pointer relative flex items-center justify-center group/tag opacity-40 hover:opacity-80"
        >
          <div className="absolute right-8 opacity-0 group-hover/tag:opacity-100 pointer-events-none">
            <div className="px-2 rounded-sm bg-border-light/40 dark:bg-border-dark/40 group-hover/tag:opacity-100 transition-all opacity-0 delay-500">
              <small className="text-xs leading-none text-dimmed-light dark:text-dimmed-dark text-nowrap">
                Add Property
              </small>
            </div>
          </div>
          <CirclePlus size={16} />
        </div>
      )}
      {trash && (
        <div
          onClick={() =>
            removeObjectAtPath({
              schemas,
              setSchemas,
              path,
            })
          }
          className="p-1 rounded-md hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark text-dimmed-light dark:text-dimmed-dark transition-all cursor-pointer relative flex items-center justify-center group/tag opacity-40 hover:opacity-80"
        >
          <div className="absolute left-8 opacity-0 group-hover/tag:opacity-100 pointer-events-none">
            <div className="px-2 rounded-sm bg-border-light/40 dark:bg-border-dark/40 group-hover/tag:opacity-100 transition-all opacity-0 delay-500">
              <small className="text-xs leading-none text-dimmed-light dark:text-dimmed-dark text-nowrap">
                Delete DB
              </small>
            </div>
          </div>
          <Trash size={16} />
        </div>
      )}
    </motion.div>
  );
}
type RemoveProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string;
};

function removeObjectAtPath({ setSchemas, schemas, path }: RemoveProps) {
  const keys = path.split(".");
  const rootKey = keys[0];

  if (keys.length === 1) {
    if (!(rootKey in schemas)) return;
    const newSchemas = { ...schemas };
    delete newSchemas[rootKey];
    setSchemas(newSchemas);
    return;
  }

  const schemaClone = structuredClone(schemas[rootKey]);
  if (!schemaClone) return;

  let current: JsonSchema | undefined = schemaClone;
  let parent: JsonSchema | undefined;
  let lastKey = "";

  for (let i = 1; i < keys.length; i++) {
    lastKey = keys[i];
    parent = current;

    if (lastKey === "items") {
      current = current.items;
    } else if (lastKey === "properties") {
      continue;
    } else if (current?.properties && current.properties[lastKey]) {
      current = current.properties[lastKey];
    } else {
      const next = (current as unknown as Record<string, unknown>)[lastKey];
      if (typeof next === "object" && next !== null && "type" in next) {
        current = next as JsonSchema;
      } else {
        return;
      }
    }

    if (!current) return;
  }

  if (parent?.properties && lastKey in parent.properties) {
    delete parent.properties[lastKey];

    if (Array.isArray(parent.required)) {
      parent.required = parent.required.filter((key) => key !== lastKey);
      if (parent.required.length === 0) delete parent.required;
    }
  }

  setSchemas({
    ...schemas,
    [rootKey]: schemaClone,
  });
}

type AddPropertyProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string;
  schema: JsonSchema;
};

function addProperty({ schemas, setSchemas, path }: AddPropertyProps) {
  const keys = path.split(".");
  const rootKey = keys[0];

  const updatedSchemas = structuredClone(schemas);
  const rootSchema = updatedSchemas[rootKey];
  if (!rootSchema) return;

  let current: JsonSchema | undefined = rootSchema;

  let lastKey = "";

  for (let i = 1; i < keys.length; i++) {
    lastKey = keys[i];

    if (!current) return;

    if (lastKey === "items") {
      current = current.items;
    } else if (lastKey === "properties") {
      continue;
    } else if (current.properties && current.properties[lastKey]) {
      current = current.properties[lastKey];
    } else {
      return;
    }
  }

  if (current?.type === "array") {
    if (!current.items || typeof current.items !== "object") {
      current.items = { type: "object", properties: {}, required: [] };
    }
    current = current.items;
  }

  if (!current || current.type !== "object") return;

  current.properties ??= {};
  current.required ??= [];

  const baseName = "new_property";
  let newName = baseName;
  let i = 1;
  while (current.properties[newName]) {
    newName = `${baseName}_${i++}`;
  }

  current.properties[newName] = { type: "string" };
  current.required.push(newName);

  updatedSchemas[rootKey] = rootSchema;

  setSchemas(updatedSchemas);
}
