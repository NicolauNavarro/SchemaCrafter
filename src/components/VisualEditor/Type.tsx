"use client";
import { motion } from "framer-motion";
import { Circle, CircleCheckBig } from "lucide-react";

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

type TypeProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  schema: JsonSchema;
  path: string;
  topHight: number;
};

const allTypes = ["string", "number", "integer", "boolean", "object", "array"];

export default function Type({
  schemas,
  setSchemas,
  schema,
  path,
  topHight,
}: TypeProps) {
  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/type left-0">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/type:z-20 left-56 -translate-x-12 pl-12 group-hover/type:translate-x-0 group-hover/type:opacity-100 opacity-0 transition-all pointer-events-none group-hover/type:pointer-events-auto -top-4 rounded-xl`}
      >
        <div
          className="min-h-full h-full bg-muted-light/30 dark:bg-muted-dark/30 rounded-xl parent-background"
          style={{ minHeight: `${(8 + topHight * 9) / 4}rem` }}
        >
          <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative child-background">
            <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base">
              type
            </p>
            <div
              onClick={() =>
                markPropertyAsId({
                  schemas,
                  setSchemas,
                  path,
                  type: "number",
                })
              }
              className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
            >
              <p className="opacity-90">
                id{" "}
                <span className="text-muted-light dark:text-muted-dark">
                  - number
                </span>
              </p>
              {schema.$comment && schema.type === "number" ? (
                <CircleCheckBig
                  size={16}
                  className="text-primary-light dark:text-primary-dark"
                />
              ) : (
                <Circle
                  size={16}
                  className="text-muted-light dark:text-muted-dark"
                />
              )}
            </div>
            <div
              onClick={() =>
                markPropertyAsId({
                  schemas,
                  setSchemas,
                  path,
                  type: "string",
                })
              }
              className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
            >
              <p className="opacity-90">
                id{" "}
                <span className="text-muted-light dark:text-muted-dark">
                  - string
                </span>
              </p>
              {schema.$comment && schema.type === "string" ? (
                <CircleCheckBig
                  size={16}
                  className="text-primary-light dark:text-primary-dark"
                />
              ) : (
                <Circle
                  size={16}
                  className="text-muted-light dark:text-muted-dark"
                />
              )}
            </div>
            {allTypes.map((typ) => (
              <div
                key={typ}
                onClick={() =>
                  changePropertyType({
                    schemas,
                    setSchemas,
                    path,
                    newType: typ,
                  })
                }
                className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
              >
                <p className="opacity-90">{typ}</p>
                {!schema.$comment && schema.type === typ ? (
                  <CircleCheckBig
                    size={16}
                    className="text-primary-light dark:text-primary-dark"
                  />
                ) : (
                  <Circle
                    size={16}
                    className="text-muted-light dark:text-muted-dark"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface ChangePropertyTypeProps {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string;
  newType: string;
}

export function changePropertyType({
  schemas,
  setSchemas,
  path,
  newType,
}: ChangePropertyTypeProps) {
  const keys = path.split(".");
  const db = keys.shift();

  if (!db || !schemas[db]) return;

  const newSchemas = structuredClone(schemas);
  let current: JsonSchema | undefined = newSchemas[db];

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!current) return;

    if (current.type === "array" && current.items) {
      current = current.items;
    }

    if (
      current.type === "object" &&
      current.properties &&
      key in current.properties
    ) {
      current = current.properties[key];
    }
  }

  const finalKey = keys[keys.length - 1];

  if (
    current &&
    current.type === "object" &&
    current.properties &&
    finalKey in current.properties
  ) {
    const targetProp = { ...current.properties[finalKey] };

    if (targetProp.$comment?.startsWith("prisma:id")) {
      delete targetProp.$comment;
    }

    targetProp.type = newType;

    delete targetProp.properties;
    delete targetProp.required;
    delete targetProp.items;

    if (newType === "object") {
      targetProp.properties = {};
      targetProp.required = [];
    } else if (newType === "array") {
      targetProp.items = {
        type: "object",
        properties: {},
      };
    }

    current.properties[finalKey] = targetProp;

    setSchemas(newSchemas);
  }
}

function markPropertyAsId({
  schemas,
  setSchemas,
  path,
  type,
}: {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string;
  type: "string" | "number";
}) {
  const pathParts = path.split(".");

  const updatedSchemas: Record<string, JsonSchema> = JSON.parse(
    JSON.stringify(schemas)
  );

  let current: JsonSchema | undefined = updatedSchemas[pathParts[0]];
  let parentSchema: JsonSchema | undefined = undefined;
  let parentProperties: Record<string, JsonSchema> | undefined = undefined;
  let targetKey: string | undefined = undefined;

  for (let i = 1; i < pathParts.length; i++) {
    const part = pathParts[i];

    if (!current) {
      console.warn("Invalid path: failed at", part);
      return;
    }

    if (part === "items") {
      if (current.type === "array" && current.items) {
        parentSchema = current;
        current = current.items;
      } else {
        console.warn("Expected 'array' type with 'items' at:", part);
        return;
      }
    } else if (part === "properties") {
      if (current.type === "object" && current.properties) {
        parentSchema = current;
        parentProperties = current.properties;
      } else {
        console.warn("Expected 'object' type with 'properties' at:", part);
        return;
      }
    } else {
      if (parentProperties && part in parentProperties) {
        targetKey = part;
        current = parentProperties[part];
      } else {
        console.warn("Property key not found:", part);
        return;
      }
    }
  }

  if (!parentProperties || !targetKey || !parentProperties[targetKey]) {
    console.warn("Target property not found at the resolved path");
    return;
  }

  const idComment =
    type === "string" ? "prisma:id uuid" : "prisma:id autoincrement";

  parentProperties[targetKey] = {
    ...parentProperties[targetKey],
    type,
    $comment: idComment,
  };

  for (const [key, prop] of Object.entries(parentProperties)) {
    if (key !== targetKey && prop.$comment?.startsWith("prisma:id")) {
      delete prop.$comment;
    }
  }

  if (parentSchema) {
    if (!parentSchema.required) {
      parentSchema.required = [];
    }
    if (!parentSchema.required.includes(targetKey)) {
      parentSchema.required.push(targetKey);
    }
  }

  setSchemas(updatedSchemas);
}
