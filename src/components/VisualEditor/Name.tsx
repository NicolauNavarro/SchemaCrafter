"use client";
import { motion } from "framer-motion";
import { useState } from "react";

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

type NameProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  name: string;
  path: string;
  objectSchema: JsonSchema;
};

export default function Name({
  schemas,
  setSchemas,
  name,
  path,
  objectSchema,
}: NameProps) {
  const [newName, setNewName] = useState("");

  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/name">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/name:z-20 left-56 -translate-x-12 group-hover/name:translate-x-0 pl-8 group-hover/name:opacity-100 opacity-0 transition-all pointer-events-none group-hover/name:pointer-events-auto pt-12 pb-12 ${
          name === Object.entries(objectSchema.properties ?? {})[0]?.[0]
            ? "-translate-y-12"
            : "-translate-y-12 "
        }`}
      >
        <div className="w-64 p-2 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative gap-2 items-end">
          <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base left-2">
            property name
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 flex items-center justify-between transition-all  hover:bg-border-light/20 dark:hover:bg-border-dark/40 rounded-lg relative outline-none focus:bg-border-light/40 dark:focus:bg-border-dark/40"
            placeholder={name}
          />
          <button
            onClick={() => {
              if (newName && newName.replace(/\s+/g, "") !== "") {
                renamePropertyInSchema({
                  schemas,
                  setSchemas,
                  path,
                  newName: newName,
                });
                setNewName("");
              }
            }}
            className="px-4 py-2 flex items-center justify-center transition-all bg-border-light/40 dark:bg-border-dark/40 hover:bg-border-light/60 dark:hover:bg-border-dark/60 rounded-lg cursor-pointer text-sm absolute -bottom-12"
          >
            Change
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function renamePropertyInSchema({
  schemas,
  setSchemas,
  path,
  newName,
}: {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string;
  newName: string;
}) {
  const pathParts = path.split(".");
  const updatedSchemas: Record<string, JsonSchema> = JSON.parse(
    JSON.stringify(schemas)
  );

  let current: JsonSchema | undefined = updatedSchemas[pathParts[0]];
  let parentSchema: JsonSchema | undefined = undefined;
  let parentProperties: Record<string, JsonSchema> | undefined = undefined;
  let oldKey: string | undefined = undefined;

  for (let i = 1; i < pathParts.length; i++) {
    const part = pathParts[i];

    if (!current) {
      console.warn("Invalid path at:", part);
      return;
    }

    if (part === "items") {
      if (current.type === "array" && current.items) {
        parentSchema = current;
        current = current.items;
      } else {
        console.warn("Expected array with items at:", part);
        return;
      }
    } else if (part === "properties") {
      if (current.type === "object" && current.properties) {
        parentSchema = current;
        parentProperties = current.properties;
      } else {
        console.warn("Expected object with properties at:", part);
        return;
      }
    } else {
      if (parentProperties && part in parentProperties) {
        oldKey = part;
        current = parentProperties[part];
      } else {
        console.warn("Property key not found:", part);
        return;
      }
    }
  }

  if (
    !parentSchema ||
    !parentProperties ||
    !oldKey ||
    !(oldKey in parentProperties)
  ) {
    console.warn("Unable to rename property — invalid state.");
    return;
  }

  const propSchema = parentProperties[oldKey];

  let finalNewName = newName;
  let counter = 1;
  while (finalNewName in parentProperties) {
    finalNewName = `${newName}_${counter}`;
    counter++;
  }

  const newProperties: Record<string, JsonSchema> = {};
  for (const [key, value] of Object.entries(parentProperties)) {
    if (key === oldKey) {
      newProperties[finalNewName] = propSchema;
    } else {
      newProperties[key] = value;
    }
  }

  parentSchema.properties = newProperties;

  if (parentSchema.required) {
    const index = parentSchema.required.indexOf(oldKey);
    if (index !== -1) {
      parentSchema.required[index] = finalNewName;
    }
  }

  setSchemas(updatedSchemas);
}
