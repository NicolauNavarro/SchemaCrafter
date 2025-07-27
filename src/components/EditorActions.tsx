"use client";

import {
  Copy,
  FileDown,
  Info,
  Maximize2,
  Minimize2,
  Wand2,
} from "lucide-react";
import { useState } from "react";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = JsonValue[];

interface ActionsProps {
  expand: boolean;
  setExpand: (value: boolean) => void;
  parsedJson?: JsonObject | null;
  setInputJson?: (value: string) => void;
  clipboard?: string;
  simple?: boolean;
}

export default function EditorActions({
  expand,
  setExpand,
  parsedJson,
  setInputJson,
  clipboard,
  simple,
}: ActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleExpand = () => setExpand(!expand);

  const handleFormatting = () => {
    if (setInputJson) {
      setInputJson(JSON.stringify(parsedJson, null, 2));
    }
  };

  const handleCopy = async () => {
    if (clipboard) {
      try {
        await navigator.clipboard.writeText(clipboard);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    } else {
      await navigator.clipboard.writeText("");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 absolute top-4 right-4 transition-opacity opacity-0 group-hover:opacity-100 z-10 select-none">
      {parsedJson && setInputJson && !simple && (
        <Toolbtn
          icon={<Wand2 size={16} />}
          tag="Format"
          handleClick={handleFormatting}
        />
      )}
      <Toolbtn icon={<Info size={16} />} tag="Help" />
      {!simple && (
        <>
          <Toolbtn
            icon={<Copy size={16} />}
            tag={copied ? "Copied" : "Copy"}
            handleClick={handleCopy}
          />
          <Toolbtn icon={<FileDown size={16} />} tag="Export" />
        </>
      )}
      <Toolbtn
        icon={expand ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        tag={expand ? "Minimize" : "Expand"}
        handleClick={handleExpand}
      />
    </div>
  );
}

type ToolProps = {
  icon: React.ReactNode;
  tag: string;
  handleClick?: () => void;
};

const Toolbtn = ({ icon, tag, handleClick }: ToolProps) => {
  return (
    <div
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-border-light dark:hover:bg-border-dark hover:text-text-light dark:hover:text-text-dark text-dimmed-light dark:text-dimmed-dark transition-all cursor-pointer relative flex items-center justify-center group/tag"
    >
      <div className="absolute top-10 opacity-0 group-hover/tag:opacity-100 pointer-events-none">
        <div className="px-2 rounded-sm bg-border-light/40 dark:bg-border-dark/40 group-hover/tag:opacity-100 transition-all opacity-0 delay-500">
          <small className="text-xs leading-none text-dimmed-light dark:text-dimmed-dark">
            {tag}
          </small>
        </div>
      </div>
      {icon}
    </div>
  );
};
