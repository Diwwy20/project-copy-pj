import { Check, Copy } from "lucide-react";

interface CopyRowProps {
  label: string;
  value: string;
  id: string;
  multiline?: boolean;
  highlight?: boolean;
  copiedField: string | null;
  onCopy: (text: string, id: string) => void;
}

export const CopyRow = ({
  label,
  value,
  id,
  multiline = false,
  highlight = false,
  copiedField,
  onCopy,
}: CopyRowProps) => (
  <div
    className={`group relative bg-white p-3 rounded-xl border transition-all flex flex-col gap-1 ${
      highlight
        ? "border-blue-300 shadow-md"
        : "border-gray-200 hover:border-blue-400 shadow-sm"
    }`}
  >
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </span>
    <div className="flex items-start gap-2">
      <div
        className={`flex-1 text-sm font-mono text-gray-800
            ${
              multiline
                ? "whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto custom-scrollbar"
                : "truncate"
            }
            ${highlight ? "font-bold" : ""}`}
      >
        {value || (
          <span className="text-gray-300 italic font-normal">No Data</span>
        )}
      </div>
      <button
        onClick={() => onCopy(value, id)}
        disabled={!value}
        className={`shrink-0 p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-medium cursor-pointer
            ${
              copiedField === id
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white group-hover:bg-blue-50 group-hover:text-blue-600"
            } ${!value && "opacity-50 cursor-not-allowed"}`}
      >
        {copiedField === id ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        {copiedField === id ? "Copied" : "Copy"}
      </button>
    </div>
  </div>
);
