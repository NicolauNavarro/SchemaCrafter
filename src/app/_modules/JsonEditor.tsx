"use client";
import EditorActions from "@/components/EditorActions";
import { motion } from "framer-motion";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = JsonValue[];

interface JsonEditorProps {
  expand: boolean;
  setExpand: (value: boolean) => void;
  parsedJson: JsonObject | null;
  setInputJson: (value: string) => void;
  inputJson: string;
}

export default function JsonEditor({
  expand,
  setExpand,
  parsedJson,
  setInputJson,
  inputJson,
}: JsonEditorProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJson(e.target.value);
  };

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

  return (
    <motion.div
      layout
      className={`h-full overflow-hidden p-4 border-border-light dark:border-border-dark flex flex-col transition-all bg-bg-light dark:bg-bg-dark z-20 ${
        expand ? "w-full border-none" : "w-1/2 border-r"
      }`}
    >
      <div className="h-full w-full relative group">
        <EditorActions
          expand={expand}
          setExpand={setExpand}
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
        {expand ? (
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
  );
}
