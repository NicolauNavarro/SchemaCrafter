"use client";
import { motion } from "framer-motion";
import {
  Asterisk,
  Circle,
  CircleCheckBig,
  CirclePlay,
  CirclePlus,
  Plus,
  Trash,
} from "lucide-react";
import EditorActions from "./EditorActions";
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

type EditorProps = {
  schemas: Record<string, JsonSchema>;
  expand: boolean;
  setExpand: (value: boolean) => void;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

export default function VisualEditor({
  schemas,
  expand,
  setExpand,
  setSchemas,
}: EditorProps) {
  return (
    <div className="w-full h-full relative group">
      <EditorActions expand={expand} setExpand={setExpand} simple={true} />
      <div className="w-full h-full overflow-scroll hide-scrollbar flex flex-col gap-8 p-4 relative group">
        {Object.entries(schemas).map(([dbName, schema]) => {
          const objectSchema = schema.type === "array" ? schema.items : schema;

          return (
            <div key={dbName} className="flex flex-col gap-2">
              <p className="text-dimmed-light dark:text-dimmed-dark">
                {dbName}
              </p>
              <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col group/db relative">
                <motion.div className="flex items-center gap-2 absolute -top-8 translate-y-2 group-hover/db:translate-y-0 right-0 transition-all opacity-0 group-hover/db:opacity-100 z-10 select-none h-8 pl-8 pr-4 pb-1">
                  <div
                    onClick={() =>
                      addProperty({
                        db: dbName,
                        schemas,
                        setSchemas,
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

                  <div
                    onClick={() =>
                      deleteDatabase({
                        db: dbName,
                        schemas,
                        setSchemas,
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
                </motion.div>

                {objectSchema?.properties ? (
                  Object.entries(objectSchema.properties).map(
                    ([propName, propSchema]) => (
                      <div
                        key={propName}
                        className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
                      >
                        <p className="opacity-90">{propName}</p>
                        <p className="text-muted-light dark:text-muted-dark">
                          {propSchema.$comment
                            ? `id · ${propSchema.type.substring(0, 3)}`
                            : propSchema.type}
                        </p>
                        <PropertyModule
                          propName={propName}
                          propSchema={propSchema}
                          dbName={dbName}
                          objectSchema={objectSchema}
                          schemas={schemas}
                          setSchemas={setSchemas}
                        />
                        <div
                          className={`absolute left-64 p-2 rounded-md transition-all hover:bg-surface-dark  ${
                            propSchema.$comment
                              ? "text-accent-light/80 dark:text-accent-dark/80 hover:text-accent-light dark:hover:text-accent-dark"
                              : objectSchema.required?.find(
                                  (r) => r == propName
                                )
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
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-gray-400 italic">No properties defined</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type PropertyModuleProps = {
  propName: string;
  propSchema: JsonSchema;
  dbName: string;
  objectSchema: JsonSchema;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

const PropertyModule = ({
  propName,
  propSchema,
  dbName,
  objectSchema,
  schemas,
  setSchemas,
}: PropertyModuleProps) => {
  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/property">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/property:z-20 left-60 -translate-x-12 group-hover/property:translate-x-0 pl-12 group-hover/property:opacity-100 opacity-0 transition-all pointer-events-none group-hover/property:pointer-events-auto group/propconifg ${
          propName === Object.entries(objectSchema.properties ?? {})[0]?.[0]
            ? "-top-4"
            : "-translate-y-4 "
        }`}
      >
        <div className="w-80 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative">
          <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base">
            {dbName} - {propName}
          </p>
          <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
            <p className="opacity-90">Type</p>
            <p className="text-muted-light dark:text-muted-dark">
              {propSchema.$comment
                ? `id · ${propSchema.type.substring(0, 3)}`
                : propSchema.type}
            </p>
            <TypeModule
              propName={propName}
              propSchema={propSchema}
              dbName={dbName}
              objectSchema={objectSchema}
              schemas={schemas}
              setSchemas={setSchemas}
            />
          </div>
          <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
            <p className="opacity-90">Property name</p>
            <p className="text-muted-light dark:text-muted-dark">{propName}</p>
            <NameModule
              propName={propName}
              propSchema={propSchema}
              dbName={dbName}
              objectSchema={objectSchema}
              schemas={schemas}
              setSchemas={setSchemas}
            />
          </div>

          <div
            onClick={() =>
              toggleRequired({
                db: dbName,
                property: propName,
                schemas: schemas,
                setSchemas: setSchemas,
              })
            }
            className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
          >
            <p className="opacity-90">Required</p>
            <p className="text-muted-light dark:text-muted-dark">
              {objectSchema.required?.find((r) => r == propName)
                ? "true"
                : "false"}
            </p>
          </div>

          {(propSchema.type === "object" || propSchema.type === "array") && (
            <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
              <p className="opacity-90">Properties</p>
              <p className="text-muted-light dark:text-muted-dark">
                {propSchema.type === "object" && propSchema.properties
                  ? Object.keys(propSchema.properties).length
                  : propSchema.type === "array" && propSchema.items
                  ? `${propSchema.items.type}s`
                  : ""}
              </p>
              <PropertiesModule
                propName={propName}
                propSchema={propSchema}
                dbName={dbName}
                objectSchema={objectSchema}
                schemas={schemas}
                setSchemas={setSchemas}
              />
            </div>
          )}

          <motion.div className="flex items-center gap-2 absolute -top-8 translate-y-2 group-hover/propconifg:translate-y-0 right-0 transition-all opacity-0 group-hover/propconifg:opacity-100 z-10 select-none h-8 pl-12 pr-4 pb-1">
            <div
              onClick={() =>
                deleteProperty({
                  db: dbName,
                  name: propName,
                  schemas,
                  setSchemas,
                })
              }
              className="p-1 rounded-md hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark text-dimmed-light dark:text-dimmed-dark transition-all cursor-pointer relative flex items-center justify-center group/tag opacity-40 hover:opacity-80"
            >
              <div className="absolute right-8 opacity-0 group-hover/tag:opacity-100 pointer-events-none">
                <div className="px-2 rounded-sm bg-border-light/40 dark:bg-border-dark/40 group-hover/tag:opacity-100 transition-all opacity-0 delay-500">
                  <small className="text-xs leading-none text-dimmed-light dark:text-dimmed-dark text-nowrap">
                    Delete Property
                  </small>
                </div>
              </div>
              <Trash size={16} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

type TypeModuleProps = {
  propName: string;
  propSchema: JsonSchema;
  dbName: string;
  objectSchema: JsonSchema;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

const allTypes = ["string", "number", "integer", "boolean", "object", "array"];

const TypeModule = ({
  propName,
  propSchema,
  dbName,
  objectSchema,
  schemas,
  setSchemas,
}: TypeModuleProps) => {
  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/type">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/type:z-20 left-72 -translate-x-12 group-hover/type:translate-x-0 pl-8 group-hover/type:opacity-100 opacity-0 transition-all pointer-events-none group-hover/type:pointer-events-auto ${
          propName === Object.entries(objectSchema.properties ?? {})[0]?.[0]
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
                db: dbName,
                property: propName,
                idType: "number",
                schemas: schemas,
                setSchemas: setSchemas,
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
            {propSchema.$comment && propSchema.type === "number" ? (
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
                db: dbName,
                property: propName,
                idType: "string",
                schemas: schemas,
                setSchemas: setSchemas,
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
            {propSchema.$comment && propSchema.type === "string" ? (
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
                  db: dbName,
                  property: propName,
                  newType: typ,
                  schemas: schemas,
                  setSchemas: setSchemas,
                })
              }
              className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
            >
              <p className="opacity-90">{typ}</p>
              {!propSchema.$comment && propSchema.type === typ ? (
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
};

type NameModuleProps = {
  propName: string;
  propSchema: JsonSchema;
  dbName: string;
  objectSchema: JsonSchema;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

const NameModule = ({
  propName,
  propSchema,
  dbName,
  objectSchema,
  schemas,
  setSchemas,
}: NameModuleProps) => {
  const [newName, setNewName] = useState("");
  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/name">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/name:z-20 left-72 -translate-x-12 group-hover/name:translate-x-0 pl-8 group-hover/name:opacity-100 opacity-0 transition-all pointer-events-none group-hover/name:pointer-events-auto pt-12 pb-12 ${
          propName === Object.entries(objectSchema.properties ?? {})[0]?.[0]
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
            placeholder={propName}
          />
          <button
            onClick={() => {
              if (newName && newName.replace(/\s+/g, "") !== "") {
                renameProperty({
                  db: dbName,
                  oldName: propName,
                  newName: newName,
                  schemas,
                  setSchemas,
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
};

type PropertiesModuleProps = {
  propName: string;
  propSchema: JsonSchema;
  dbName: string;
  objectSchema: JsonSchema;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

const PropertiesModule = ({
  propName,
  propSchema,
  dbName,
  objectSchema,
  schemas,
  setSchemas,
}: PropertiesModuleProps) => {
  const childSchema =
    propSchema.type === "array" ? propSchema.items : propSchema;

  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/type">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/type:z-20 left-72 -translate-x-12 group-hover/type:translate-x-0 pl-8 group-hover/type:opacity-100 opacity-0 transition-all pointer-events-none group-hover/type:pointer-events-auto ${
          propName === Object.entries(objectSchema.properties ?? {})[0]?.[0]
            ? "-top-4"
            : "-translate-y-4"
        }`}
      >
        <div className="w-64 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative">
          <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base">
            {propName} - properties
          </p>
          {childSchema?.properties &&
          Object.keys(childSchema.properties).length > 0 ? (
            Object.entries(childSchema.properties).map(
              ([childPropName, childPropSchema]) => (
                <div
                  key={childPropName}
                  className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
                >
                  <p className="opacity-90">{childPropName}</p>
                  <p className="text-muted-light dark:text-muted-dark">
                    {childPropSchema.type}
                  </p>
                  <ChildPropertyModule
                    propName={childPropName}
                    propSchema={childPropSchema}
                    parent={propName}
                    dbName={dbName}
                    schemas={schemas}
                    setSchemas={setSchemas}
                    objectSchema={childSchema}
                  />
                </div>
              )
            )
          ) : (
            <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
              <p className="opacity-90">No properties defined</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

type RequiredProps = {
  db: string;
  property: string;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

function toggleRequired({ db, property, schemas, setSchemas }: RequiredProps) {
  const schema = schemas[db];

  if (
    !schema ||
    schema.type !== "array" ||
    typeof schema.items !== "object" ||
    schema.items.type !== "object"
  ) {
    return;
  }

  const objectSchema = schema.items;
  const currentRequired = objectSchema.required || [];

  const propertySchema = objectSchema.properties?.[property];
  const isId = propertySchema && "$comment" in propertySchema;

  let updatedRequired: string[] = currentRequired;

  if (isId) {
    if (!currentRequired.includes(property)) {
      updatedRequired = [...currentRequired, property];
    } else {
      setSchemas(schemas);
      return;
    }
  } else {
    if (currentRequired.includes(property)) {
      updatedRequired = currentRequired.filter((p) => p !== property);
    } else {
      updatedRequired = [...currentRequired, property];
    }
  }

  const updatedSchema = {
    ...schemas,
    [db]: {
      ...schema,
      items: {
        ...objectSchema,
        required: updatedRequired,
      },
    },
  };

  setSchemas(updatedSchema);
}

function markPropertyAsId({
  db,
  property,
  idType,
  schemas,
  setSchemas,
}: {
  db: string;
  property: string;
  idType: "string" | "number";
  schemas: Record<string, JsonSchema>;
  setSchemas: (schemas: Record<string, JsonSchema>) => void;
}) {
  const schema = schemas[db];
  if (
    !schema ||
    schema.type !== "array" ||
    !schema.items ||
    schema.items.type !== "object" ||
    !schema.items.properties
  ) {
    return;
  }

  const properties = schema.items.properties;

  const updatedProperties: Record<string, JsonSchema> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const newProp = { ...prop };

    if (newProp.$comment?.startsWith("prisma:id")) {
      delete newProp.$comment;
    }
    updatedProperties[key] = newProp;
  }

  updatedProperties[property] = {
    ...updatedProperties[property],
    type: idType,
    $comment:
      idType === "string" ? "prisma:id uuid" : "prisma:id autoincrement",
  };

  const updatedSchema = {
    ...schemas,
    [db]: {
      ...schema,
      items: {
        ...schema.items,
        properties: updatedProperties,
      },
    },
  };

  toggleRequired({
    db: db,
    property: property,
    schemas: updatedSchema,
    setSchemas: setSchemas,
  });
}

type ChenagePropertyTypeProps = {
  db: string;
  property: string;
  newType: string;
  schemas: Record<string, JsonSchema>;
  setSchemas: (schemas: Record<string, JsonSchema>) => void;
};

function changePropertyType({
  db,
  property,
  newType,
  schemas,
  setSchemas,
}: ChenagePropertyTypeProps) {
  const schema = schemas[db];

  if (
    !schema ||
    schema.type !== "array" ||
    !schema.items ||
    schema.items.type !== "object" ||
    !schema.items.properties
  ) {
    return;
  }

  const properties = schema.items.properties;

  const updatedProperties: Record<string, JsonSchema> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const newProp = { ...prop };

    if (key === property) {
      if (newProp.$comment?.startsWith("prisma:id")) {
        delete newProp.$comment;
      }

      newProp.type = newType;

      delete newProp.properties;
      delete newProp.required;
      delete newProp.items;

      if (newType === "object") {
        newProp.properties = {};
        newProp.required = [];
      } else if (newType === "array") {
        newProp.items = { type: "string" };
      }
    }

    updatedProperties[key] = newProp;
  }

  const updatedSchema = {
    ...schemas,
    [db]: {
      ...schema,
      items: {
        ...schema.items,
        properties: updatedProperties,
      },
    },
  };

  setSchemas(updatedSchema);
}

function renameProperty({
  db,
  oldName,
  newName,
  schemas,
  setSchemas,
}: {
  db: string;
  oldName: string;
  newName: string;
  schemas: Record<string, JsonSchema>;
  setSchemas: (schemas: Record<string, JsonSchema>) => void;
}) {
  const schema = schemas[db];

  if (
    !schema ||
    schema.type !== "array" ||
    !schema.items ||
    schema.items.type !== "object" ||
    !schema.items.properties
  ) {
    return;
  }

  const properties = schema.items.properties;

  // Do nothing if old property doesn't exist or new name is already taken
  if (!properties[oldName] || properties[newName]) {
    return;
  }

  const updatedProperties: Record<string, JsonSchema> = {};
  for (const key of Object.keys(properties)) {
    if (key === oldName) {
      updatedProperties[newName] = { ...properties[oldName] };
    } else {
      updatedProperties[key] = properties[key];
    }
  }

  // Handle required list
  let updatedRequired = schema.items.required || [];
  if (updatedRequired.includes(oldName)) {
    updatedRequired = updatedRequired
      .filter((key) => key !== oldName)
      .concat(newName);
  }

  const updatedSchema = {
    ...schemas,
    [db]: {
      ...schema,
      items: {
        ...schema.items,
        properties: updatedProperties,
        required: updatedRequired,
      },
    },
  };

  setSchemas(updatedSchema);
}

type DeleteDatabaseProps = {
  db: string;
  schemas: Record<string, JsonSchema>;
  setSchemas: (schemas: Record<string, JsonSchema>) => void;
};

function deleteDatabase({ db, schemas, setSchemas }: DeleteDatabaseProps) {
  const { [db]: _, ...remainingSchemas } = schemas;
  setSchemas(remainingSchemas);
}

type AddPropertyProps = {
  db: string;
  schemas: Record<string, JsonSchema>;
  setSchemas: (schemas: Record<string, JsonSchema>) => void;
};

function addProperty({ db, schemas, setSchemas }: AddPropertyProps) {
  const schema = schemas[db];
  if (!schema) return;

  const baseName = "new_property";

  // Function to find a unique property name like new_property, new_property_1, new_property_2, ...
  function getUniquePropertyName(
    existingProps: Record<string, JsonSchema>,
    base: string
  ): string {
    if (!existingProps[base]) return base;

    let counter = 1;
    let name = `${base}_${counter}`;
    while (existingProps[name]) {
      counter++;
      name = `${base}_${counter}`;
    }
    return name;
  }

  const newProp = { type: "string" };

  let updatedSchema = { ...schema };

  // Case 1: Schema is an object
  if (schema.type === "object" && schema.properties) {
    const uniqueName = getUniquePropertyName(schema.properties, baseName);

    updatedSchema = {
      ...schema,
      properties: {
        ...schema.properties,
        [uniqueName]: newProp,
      },
      required: [...(schema.required || []), uniqueName],
    };
  }

  // Case 2: Schema is an array of objects
  else if (schema.type === "array" && schema.items?.type === "object") {
    const existingProps = schema.items.properties || {};
    const uniqueName = getUniquePropertyName(existingProps, baseName);

    updatedSchema = {
      ...schema,
      items: {
        ...schema.items,
        properties: {
          ...existingProps,
          [uniqueName]: newProp,
        },
        required: [...(schema.items.required || []), uniqueName],
      },
    };
  }

  // Update schemas
  setSchemas({
    ...schemas,
    [db]: updatedSchema,
  });
}

type DeletePropertyProps = {
  db: string;
  name: string;
  schemas: Record<string, JsonSchema>;
  setSchemas: (schemas: Record<string, JsonSchema>) => void;
};

function deleteProperty({
  db,
  name,
  schemas,
  setSchemas,
}: DeletePropertyProps) {
  const schema = schemas[db];
  if (!schema) return;

  let updatedSchema = { ...schema };

  // Case 1: Schema is an object
  if (schema.type === "object" && schema.properties) {
    const { [name]: _, ...remainingProps } = schema.properties;
    const newRequired = (schema.required || []).filter(
      (prop: string) => prop !== name
    );

    updatedSchema = {
      ...schema,
      properties: remainingProps,
      required: newRequired,
    };
  }

  // Case 2: Schema is an array of objects
  else if (schema.type === "array" && schema.items?.type === "object") {
    const { [name]: _, ...remainingProps } = schema.items.properties || {};
    const newRequired = (schema.items.required || []).filter(
      (prop: string) => prop !== name
    );

    updatedSchema = {
      ...schema,
      items: {
        ...schema.items,
        properties: remainingProps,
        required: newRequired,
      },
    };
  }

  // Update schemas
  setSchemas({
    ...schemas,
    [db]: updatedSchema,
  });
}

type ChildPropertyModuleProps = {
  propName: string;
  propSchema: JsonSchema;
  dbName: string;
  parent: string;
  objectSchema: JsonSchema;
  schemas: Record<string, JsonSchema>;
  setSchemas: (value: Record<string, JsonSchema>) => void;
};

const ChildPropertyModule = ({
  propName,
  propSchema,
  dbName,
  parent,
  objectSchema,
  schemas,
  setSchemas,
}: ChildPropertyModuleProps) => {
  return (
    <div className="absolute z-10 w-full h-full rounded-lg group/childproperty">
      <motion.div
        layout
        className={`absolute delay-300 group-hover/childproperty:z-20 left-60 -translate-x-12 group-hover/childproperty:translate-x-0 pl-12 group-hover/childproperty:opacity-100 opacity-0 transition-all pointer-events-none group-hover/childproperty:pointer-events-auto group/propconifg ${
          propName === Object.entries(objectSchema.properties ?? {})[0]?.[0]
            ? "-top-4"
            : "-translate-y-4 "
        }`}
      >
        <div className="w-80 p-2 py-4 rounded-xl bg-surface-light dark:bg-surface-dark text-sm flex flex-col relative">
          <p className="absolute -top-8 text-dimmed-light dark:text-dimmed-dark text-base">
            {dbName} - {propName}
          </p>
          <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
            <p className="opacity-90">Type</p>
            <p className="text-muted-light dark:text-muted-dark">
              {propSchema.$comment
                ? `id · ${propSchema.type.substring(0, 3)}`
                : propSchema.type}
            </p>
          </div>
          <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
            <p className="opacity-90">Property name</p>
            <p className="text-muted-light dark:text-muted-dark">{propName}</p>
          </div>

          <div
            onClick={() =>
              toggleRequired({
                db: dbName,
                property: propName,
                schemas: schemas,
                setSchemas: setSchemas,
              })
            }
            className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative"
          >
            <p className="opacity-90">Required</p>
            <p className="text-muted-light dark:text-muted-dark">
              {objectSchema.required?.find((r) => r == propName)
                ? "true"
                : "false"}
            </p>
          </div>

          {(propSchema.type === "object" || propSchema.type === "array") && (
            <div className="w-full px-4 py-2 flex items-center justify-between transition-all hover:bg-border-light/40 dark:hover:bg-border-dark/40 rounded-lg cursor-pointer relative">
              <p className="opacity-90">Properties</p>
              <p className="text-muted-light dark:text-muted-dark">
                {propSchema.type === "object" && propSchema.properties
                  ? Object.keys(propSchema.properties).length
                  : propSchema.type === "array" && propSchema.items
                  ? `${propSchema.items.type}s`
                  : ""}
              </p>
              <PropertiesModule
                propName={propName}
                propSchema={propSchema}
                dbName={dbName}
                objectSchema={objectSchema}
                schemas={schemas}
                setSchemas={setSchemas}
              />
            </div>
          )}

          <motion.div className="flex items-center gap-2 absolute -top-8 translate-y-2 group-hover/propconifg:translate-y-0 right-0 transition-all opacity-0 group-hover/propconifg:opacity-100 z-10 select-none h-8 pl-12 pr-4 pb-1">
            <div
              onClick={() =>
                deleteProperty({
                  db: dbName,
                  name: propName,
                  schemas,
                  setSchemas,
                })
              }
              className="p-1 rounded-md hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark text-dimmed-light dark:text-dimmed-dark transition-all cursor-pointer relative flex items-center justify-center group/tag opacity-40 hover:opacity-80"
            >
              <div className="absolute right-8 opacity-0 group-hover/tag:opacity-100 pointer-events-none">
                <div className="px-2 rounded-sm bg-border-light/40 dark:bg-border-dark/40 group-hover/tag:opacity-100 transition-all opacity-0 delay-500">
                  <small className="text-xs leading-none text-dimmed-light dark:text-dimmed-dark text-nowrap">
                    Delete Property
                  </small>
                </div>
              </div>
              <Trash size={16} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
