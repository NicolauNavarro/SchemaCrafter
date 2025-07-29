"use client";
import { motion } from "framer-motion";
import Actions from "./Actions";
import Properties from "./Properties";
import Type from "./Type";
import Name from "./Name";

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

type PropertyProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  name: string;
  schema: JsonSchema;
  path: string;
  objectSchema: JsonSchema;
  parentName: string;
  topHight: number;
  childIndex: number;
};

export default function Property({
  schemas,
  setSchemas,
  name,
  schema,
  path,
  objectSchema,
  parentName,
  topHight,
  childIndex,
}: PropertyProps) {
  let newTopHight = topHight;
  if ((schema.type === "object" || schema.type === "array") && topHight < 4) {
    newTopHight = 4;
  } else if (topHight < 3) {
    newTopHight = 3;
  }

  return (
    <div
      className={`absolute z-10 w-full h-full rounded-lg property-parent left-0`}
    >
      <motion.div
        layout
        className={`property-child absolute delay-300 left-56 -translate-x-12 pl-12 opacity-0 transition-all pointer-events-none rounded-xl`}
        style={{
          top: `-${(4 + childIndex * 9) / 4}rem`,
        }}
      >
        <div
          className="min-h-full h-full bg-muted-light/30 dark:bg-muted-dark/30  rounded-xl parent-background transition-all"
          style={{ minHeight: `${(8 + newTopHight * 9) / 4}rem` }}
        >
          <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative actions-parent child-background">
            <Actions
              schemas={schemas}
              setSchemas={setSchemas}
              schema={schema}
              path={path}
              trash={true}
            />
            <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base">
              {parentName} - {name}
            </p>
            <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
              <p className="opacity-90">Type</p>
              <p className="text-muted-light dark:text-muted-dark">
                {schema.$comment
                  ? `id · ${schema.type.substring(0, 3)}`
                  : schema.type}
              </p>
              <Type
                schemas={schemas}
                setSchemas={setSchemas}
                schema={schema}
                path={path}
                topHight={newTopHight}
              />
            </div>
            <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
              <p className="opacity-90">Name</p>
              <p className="text-muted-light dark:text-muted-dark">{name}</p>
              <Name
                schemas={schemas}
                setSchemas={setSchemas}
                name={name}
                path={path}
                objectSchema={objectSchema}
              />
            </div>

            <div
              onClick={() =>
                togglePropertyRequired({
                  schemas,
                  setSchemas,
                  path,
                })
              }
              className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
            >
              <p className="opacity-90">Required</p>
              <p className="text-muted-light dark:text-muted-dark">
                {objectSchema.required?.find((r) => r == name)
                  ? "true"
                  : "false"}
              </p>
            </div>

            {(schema.type === "object" || schema.type === "array") && (
              <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
                <p className="opacity-90">Properties</p>
                <p className="text-muted-light dark:text-muted-dark">
                  {schema.type === "object" && schema.properties
                    ? Object.keys(schema.properties).length
                    : schema.type === "array" && schema.items
                    ? `${schema.items.type}s`
                    : ""}
                </p>
                <Properties
                  schemas={schemas}
                  setSchemas={setSchemas}
                  name={name}
                  schema={schema}
                  path={path}
                  childIndex={3}
                  topHight={newTopHight}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function togglePropertyRequired({
  schemas,
  setSchemas,
  path,
}: {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  path: string;
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
        console.warn("Property not found at:", part);
        return;
      }
    }
  }

  if (!parentSchema || !targetKey || !parentProperties) {
    console.warn("Unable to toggle required: target not found.");
    return;
  }

  const targetProp = parentProperties[targetKey];

  if (targetProp.$comment?.startsWith("prisma:id")) {
    console.info(
      `Property "${targetKey}" is marked as ID and must remain required.`
    );
    if (!parentSchema.required?.includes(targetKey)) {
      parentSchema.required = parentSchema.required || [];
      parentSchema.required.push(targetKey);
    }
    setSchemas(updatedSchemas);
    return;
  }

  if (!parentSchema.required) {
    parentSchema.required = [targetKey];
  } else {
    const index = parentSchema.required.indexOf(targetKey);
    if (index === -1) {
      parentSchema.required.push(targetKey);
    } else {
      parentSchema.required.splice(index, 1);
    }
  }

  setSchemas(updatedSchemas);
}
