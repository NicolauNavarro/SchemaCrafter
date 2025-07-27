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
  name: string;
  schema: JsonSchema;
  path: string;
  objectSchema: JsonSchema;
};

const allTypes = ["string", "number", "integer", "boolean", "object", "array"];

export default function Type({
  schemas,
  setSchemas,
  name,
  schema,
  path,
  objectSchema,
}: TypeProps) {
  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/type">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/type:z-20 left-72 -translate-x-12 group-hover/type:translate-x-0 pl-8 group-hover/type:opacity-100 opacity-0 transition-all pointer-events-none group-hover/type:pointer-events-auto ${
          name === Object.entries(objectSchema.properties ?? {})[0]?.[0]
            ? "-top-4"
            : "-translate-y-4 "
        }`}
      >
        <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative">
          <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base">
            type
          </p>
          <div
            onClick={() =>
              markPropertyAsId({
                schemas,
                setSchemas,
                schema,
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
                schema,
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
                  schema,
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
      </motion.div>
    </div>
  );
}

interface ChangePropertyTypeProps {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string; // e.g., "products.items.colors.items.hex"
  schema: JsonSchema;
  newType: string;
}

export function changePropertyType({
  schemas,
  setSchemas,
  path,
  schema,
  newType,
}: ChangePropertyTypeProps) {
  const keys = path.split(".");
  const db = keys.shift(); // top-level key like "users" or "products"

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

    // Clean up previous structure
    delete targetProp.properties;
    delete targetProp.required;
    delete targetProp.items;

    // Re-initialize structure based on new type
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
  schema,
  type,
}: {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string; // e.g. "products.items.properties.product_name"
  schema: JsonSchema;
  type: "string" | "number";
}) {
  const pathParts = path.split(".");

  // Deep clone to avoid mutation
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
        // 👇 The next key will be a property key (not 'properties' or 'items')
        // so we don't move current yet
      } else {
        console.warn("Expected 'object' type with 'properties' at:", part);
        return;
      }
    } else {
      // 🔍 This should be a property key in parentProperties
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

  // ✅ Set the ID comment and enforce type
  const idComment =
    type === "string" ? "prisma:id uuid" : "prisma:id autoincrement";

  parentProperties[targetKey] = {
    ...parentProperties[targetKey],
    type,
    $comment: idComment,
  };

  // ❌ Remove ID comments from siblings
  for (const [key, prop] of Object.entries(parentProperties)) {
    if (key !== targetKey && prop.$comment?.startsWith("prisma:id")) {
      delete prop.$comment;
    }
  }

  // ✅ Ensure it's required
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
