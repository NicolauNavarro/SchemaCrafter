"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EditorActions from "@/components/EditorActions";
import VisualEditor from "@/components/VisualEditor";

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

export default function SchemaSnap() {
  const [inputJson, setInputJson] = useState<string>("");
  const [parsedJson, setParsedJson] = useState<JsonObject | null>(null);
  const [schemas, setSchemas] = useState<Record<string, JsonSchema>>({});
  const [error, setError] = useState<string | null>(null);
  const [labMode, setLabMode] = useState(false);
  const [spandSchema, setSpandSchema] = useState(false);
  const [spandInput, setSpandInput] = useState(false);
  const [spandVisual, setSpandVisual] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJson(e.target.value);
  };

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
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        inputJson.substring(0, start) + "\t" + inputJson.substring(end);
      setInputJson(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleLabToggle = () => setLabMode(!labMode);

  return (
    <motion.div
      layout
      className="w-full h-full overflow-hidden flex justify-between"
    >
      {!labMode && !spandSchema && (
        <motion.div
          layout
          className={`h-full overflow-hidden p-4 border-border-light dark:border-border-dark flex flex-col transition-all bg-bg-light dark:bg-bg-dark z-20 ${
            spandInput ? "w-full border-none" : "w-1/2 border-r"
          }`}
        >
          <div className="h-full w-full relative group">
            <EditorActions
              expand={spandInput}
              setExpand={setSpandInput}
              parsedJson={parsedJson}
              setInputJson={setInputJson}
              clipboard={inputJson}
            />
            <textarea
              value={inputJson}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              placeholder="Write your JSON with multiple root keys (e.g., User, Post)..."
              className="resize-none border-none outline-none rounded-lg bg-surface-light dark:bg-surface-dark font-mono text-sm p-4 text-code-light dark:text-code-dark h-full w-full overflow-scroll hide-scrollbar"
            ></textarea>
            {spandInput ? (
              <div className="z-10 absolute bottom-8 right-8 py-2 px-4 border border-border-light dark:border-border-dark rounded-lg transition-all select-none">
                <p
                  className={` ${
                    parsedJson || inputJson.replace(/\s+/g, "") === ""
                      ? "text-muted-light dark:text-muted-dark"
                      : "text-red-600/60 dark:text-red-400/60 font-semibold"
                  }`}
                >
                  {parsedJson
                    ? "Accepted, JSON is valid"
                    : inputJson.replace(/\s+/g, "") === ""
                    ? "Start typing JSON"
                    : "Denied, JSON is invalid"}
                </p>
              </div>
            ) : (
              ""
            )}
          </div>
        </motion.div>
      )}

      {!spandInput && !spandVisual && (
        <motion.div
          layout
          className={`h-full overflow-hidden p-4 border-border-light dark:border-border-dark flex flex-col relative bg-bg-light dark:bg-bg-dark z-30 ${
            spandSchema
              ? "border-none w-full"
              : labMode
              ? "border-r w-1/3"
              : "border-l w-1/2"
          }`}
        >
          {Object.keys(schemas).length > 0 ? (
            <div className="h-full w-full relative group">
              <EditorActions
                expand={spandSchema}
                setExpand={setSpandSchema}
                clipboard={JSON.stringify(schemas, null, 2)}
              />
              <pre className="resize-none border-none outline-none rounded-lg font-mono text-sm p-4 text-code-light dark:text-code-dark h-full overflow-scroll hide-scrollbar w-full">
                {JSON.stringify(schemas, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="p-4">Schema is empty or invalid</p>
          )}
          {!spandSchema && (
            <motion.button
              layout
              onClick={handleLabToggle}
              className={`absolute ${
                labMode ? "left-8" : "right-8"
              } bottom-8 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark text-dimmed-light dark:text-dimmed-dark shadow-2xl border border-border-light dark:border-border-dark cursor-pointer hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark transition-colors`}
            >
              {labMode ? "Back to JSON" : "Continue to lab"}
            </motion.button>
          )}
        </motion.div>
      )}

      {labMode && !spandSchema && (
        <motion.div
          layout
          className={`h-full overflow-hidden p-4 border-l border-border-light dark:border-border-dark flex flex-col relative bg-bg-light dark:bg-bg-dark z-30 select-none ${
            spandVisual ? "w-full" : "w-2/3"
          }`}
        >
          <VisualEditor
            schemas={schemas}
            expand={spandVisual}
            setExpand={setSpandVisual}
            setSchemas={setSchemas}
          />
        </motion.div>
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
