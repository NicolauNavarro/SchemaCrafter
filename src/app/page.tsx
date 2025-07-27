"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import VisualEditor from "./_modules/VisualEditor";
import JsonEditor from "./_modules/JsonEditor";
import SchemaEditor from "./_modules/SchemaEditor";

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

export default function Home() {
  const [inputJson, setInputJson] = useState<string>("");
  const [parsedJson, setParsedJson] = useState<JsonObject | null>(null);
  const [schemas, setSchemas] = useState<Record<string, JsonSchema>>({});
  const [error, setError] = useState<string | null>(null);
  const [labMode, setLabMode] = useState(false);
  const [expandSchema, setExpandSchema] = useState(false);
  const [expandInput, setExpandInput] = useState(false);
  const [expandVisual, setExpandVisual] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(inputJson);
      setParsedJson(parsed);
      setError(null);

      if (
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        parsed !== null
      ) {
        const schemaSet: Record<string, JsonSchema> = {};
        for (const key in parsed) {
          schemaSet[key] = inferSchema(parsed[key]);
        }
        setSchemas(schemaSet);
        console.log(schemaSet);
      } else {
        throw new Error(
          "Root JSON must be an object containing multiple schemas."
        );
      }
    } catch (err) {
      setParsedJson(null);
      setSchemas({});
      setError("Invalid JSON");
    }
  }, [inputJson]);

  useEffect(() => {
    const cleanup = themeToggleShortcut();
    return cleanup;
  }, []);

  return (
    <motion.div
      layout
      className="w-full h-full overflow-hidden flex justify-between"
    >
      {!labMode && !expandSchema && (
        <JsonEditor
          expand={expandInput}
          setExpand={setExpandInput}
          parsedJson={parsedJson}
          inputJson={inputJson}
          setInputJson={setInputJson}
        />
      )}

      {!expandInput && !expandVisual && (
        <SchemaEditor
          expand={expandSchema}
          setExpand={setExpandSchema}
          labMode={labMode}
          setLabMode={setLabMode}
          schemas={schemas}
        />
      )}

      {labMode && !expandSchema && (
        <VisualEditor
          expand={expandVisual}
          setExpand={setExpandVisual}
          schemas={schemas}
          setSchemas={setSchemas}
        />
      )}
    </motion.div>
  );
}

function inferSchema(value: JsonValue): JsonSchema {
  if (value === null) return { type: "null" };
  if (typeof value === "string") {
    const isDate = !isNaN(Date.parse(value));
    return { type: "string", ...(isDate ? { format: "date-time" } : {}) };
  }
  if (typeof value === "number") return { type: "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  if (Array.isArray(value)) {
    const schemas = value.map(inferSchema);
    if (schemas.length === 0) return { type: "array", items: { type: "any" } };
    const merged = mergeSchemas(schemas);
    return { type: "array", items: merged };
  }
  if (typeof value === "object") {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];
    for (const key in value) {
      properties[key] = inferSchema(value[key]);
      required.push(key);
    }
    return { type: "object", properties, required };
  }
  return { type: "unknown" };
}

function mergeSchemas(schemas: JsonSchema[]): JsonSchema {
  if (schemas.every((s) => s.type === "object")) {
    const mergedProperties: Record<string, JsonSchema> = {};
    const required: Set<string> = new Set();
    for (const schema of schemas) {
      if (!schema.properties) continue;
      for (const key in schema.properties) {
        const propSchema = schema.properties[key];
        mergedProperties[key] = mergedProperties[key]
          ? mergeSchemas([mergedProperties[key], propSchema])
          : propSchema;
      }
      schema.required?.forEach((key) => required.add(key));
    }
    return {
      type: "object",
      properties: mergedProperties,
      required: Array.from(required),
    };
  }
  const types = Array.from(new Set(schemas.map((s) => s.type)));
  return types.length === 1 ? schemas[0] : { type: types.join(" | ") };
}

function themeToggleShortcut() {
  const toggleTheme = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      const html = document.documentElement;
      const currentTheme = html.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    html.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }

  window.addEventListener("keydown", toggleTheme);
  return () => window.removeEventListener("keydown", toggleTheme);
}
