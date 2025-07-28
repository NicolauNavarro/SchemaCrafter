"use client";
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

type DatabaseProps = {
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
  name: string;
  schema: JsonSchema;
  path: string;
};

export default function Database({
  schemas,
  setSchemas,
  name,
  schema,
  path,
}: DatabaseProps) {
  const objectSchema = schema.type === "array" ? schema.items : schema;

  const totalChildren = Object.keys(objectSchema?.properties || {}).length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-dimmed-light dark:text-dimmed-dark">{name}</p>
      <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative actions-parent">
        <Actions
          schemas={schemas}
          setSchemas={setSchemas}
          schema={schema}
          path={path}
          trash={true}
          add={true}
        />

        {objectSchema?.properties ? (
          Object.entries(objectSchema.properties).map(
            ([childName, childSchema], index) => (
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
                  childIndex={index}
                  topHight={totalChildren}
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
  );
}

function buildPath(parentPath: string, type: string, key: string) {
  return `${parentPath}.${
    type === "array" ? "items.properties" : "properties"
  }.${key}`;
}
