import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Search,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Box,
  DollarSign,
  ChevronDown,
  AlertCircle,
  Package,
  type LucideIcon,
} from "lucide-react";

// --- Type Definitions ---
interface ProductData {
  sku: string;
  nameEn: string;
  nameTh: string;
  descEn: string;
  descTh: string;
  brand: string;
  price: string;
  stock: string;
  weight: string;
  w: string;
  l: string;
  h: string;
  images: string[];
  video: string;
}

const DEFAULT_DATA: ProductData = {
  sku: "",
  nameEn: "",
  nameTh: "",
  descEn: "",
  descTh: "",
  brand: "",
  price: "",
  stock: "",
  weight: "",
  w: "",
  l: "",
  h: "",
  images: [],
  video: "",
};

// --- Sub-Components (Extracted Outside App) ---

// 1. SectionHeader
interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

const SectionHeader = ({ icon: Icon, title }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-4 mt-8">
    <div className="p-1.5 bg-blue-100 rounded-full text-blue-700">
      <Icon className="w-5 h-5" />
    </div>
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
  </div>
);

// 2. CopyRow
interface CopyRowProps {
  label: string;
  value: string;
  id: string;
  multiline?: boolean;
  highlight?: boolean;
  copiedField: string | null;
  onCopy: (text: string, id: string) => void;
}

const CopyRow = ({
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
        className={`shrink-0 p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-medium
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

// --- Main App Component ---
export default function App() {
  // --- States ---
  const [productDatabase, setProductDatabase] = useState<
    Record<string, ProductData>
  >({});
  const [currentData, setCurrentData] = useState<ProductData>(DEFAULT_DATA);
  const [dbSize, setDbSize] = useState(0);

  const [searchSku, setSearchSku] = useState("");
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "found" | "not-found"
  >("idle");

  const [encoding, setEncoding] = useState("utf-8");
  const [rawFile, setRawFile] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");

  // Copy Feedback State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Logic การ Parse CSV แยกออกมาเป็นฟังก์ชัน
   */
  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/);

    // Heuristic: Find header row
    let headerRowIndex = -1;
    let headers: string[] = [];

    // Helper for line parsing
    const parseCSVLine = (text: string): string[] => {
      const result = [];
      let cell = "";
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          if (inQuotes && text[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(cell.trim());
          cell = "";
        } else cell += char;
      }
      result.push(cell.trim());
      return result;
    };

    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      if (
        lines[i].toLowerCase().includes("sku") &&
        lines[i].toLowerCase().includes("price")
      ) {
        headerRowIndex = i;
        headers = parseCSVLine(lines[i]);
        break;
      }
    }

    if (headerRowIndex === -1 && lines.length > 0) {
      console.warn("Could not auto-detect header. Using row 0.");
      headerRowIndex = 0;
      headers = parseCSVLine(lines[0]);
    } else if (headerRowIndex === -1) {
      setDbSize(0);
      setProductDatabase({});
      return;
    }

    const newDb: Record<string, ProductData> = {};
    let count = 0;

    const getIdx = (keywords: string[]) =>
      headers.findIndex(
        (h) =>
          h && keywords.some((k) => h.toLowerCase().trim() === k.toLowerCase())
      );

    const idxSku = getIdx([
      "Parent SKU",
      "SKU",
      "sku",
      "parent_sku",
      "parent_sku_code",
    ]);
    const idxNameEn = getIdx([
      "Product Name (EN)",
      "product_name_en",
      "product_name",
    ]);
    const idxNameTh = getIdx(["Product Name (TH)", "product_name_th"]);
    const idxDescEn = getIdx([
      "Product Description (EN)",
      "product_description_en",
      "product_description",
    ]);
    const idxDescTh = getIdx([
      "Product Description (TH)",
      "product_description_th",
    ]);
    const idxBrand = getIdx(["Brand ID", "Brand", "brand", "brand_id"]);

    const idxPrice = getIdx(["Normal Price", "Price", "price", "normal_price"]);
    const idxStock = getIdx(["Stock", "stock", "quantity"]);
    const idxWeight = getIdx(["Weight", "weight", "net_weight"]);
    const idxL = getIdx(["Length", "length", "package_length"]);
    const idxW = getIdx(["Width", "width", "package_width"]);
    const idxH = getIdx(["Height", "height", "package_height"]);

    const idxVideo = getIdx(["Video", "Video URL", "video", "video_url"]);

    const imgIndices: number[] = [];
    headers.forEach((h, idx) => {
      if (
        h &&
        (h.toLowerCase().includes("cover image") ||
          h.toLowerCase().includes("image ") ||
          h.toLowerCase().includes("image_"))
      ) {
        imgIndices.push(idx);
      }
    });

    for (let i = headerRowIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const row = parseCSVLine(line);
      if (row.length <= idxSku) continue;

      const sku = row[idxSku]?.trim();

      if (sku) {
        const imgs = imgIndices
          .map((idx) => row[idx])
          .filter((url) => url && url.trim().length > 0);

        newDb[sku] = {
          sku: sku,
          nameEn: row[idxNameEn] || "",
          nameTh: row[idxNameTh] || "",
          descEn: row[idxDescEn] || "",
          descTh: row[idxDescTh] || "",
          brand: row[idxBrand] || "",
          price: (row[idxPrice] || "0").replace(/[^\d.]/g, ""),
          stock: (row[idxStock] || "0").replace(/[^\d.]/g, ""),
          weight: (row[idxWeight] || "0").replace(/[^\d.]/g, ""),
          l: (row[idxL] || "0").replace(/[^\d.]/g, ""),
          w: (row[idxW] || "0").replace(/[^\d.]/g, ""),
          h: (row[idxH] || "0").replace(/[^\d.]/g, ""),
          video: row[idxVideo] || "",
          images: imgs,
        };
        count++;
      }
    }

    setProductDatabase(newDb);
    setDbSize(count);
  };

  /**
   * ฟังก์ชันกลางสำหรับ Decode และสั่ง Parse
   */
  const decodeAndParse = (buffer: ArrayBuffer, enc: string) => {
    try {
      const decoder = new TextDecoder(enc);
      const text = decoder.decode(buffer);
      parseCSV(text);
    } catch (error) {
      console.error(
        "Error decoding file. Please try a different encoding.",
        error
      );
    }
  };

  // --- Event Handlers (Modified) ---

  // 1. Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Clear old data
    setCurrentData(DEFAULT_DATA);
    setSearchSku("");
    setSearchStatus("idle");

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;

      // Update State
      setRawFile(buffer);

      // Trigger Logic IMMEDIATELY (Fix for cascading render warning)
      decodeAndParse(buffer, encoding);
    };
    reader.readAsArrayBuffer(file);
  };

  // 2. Handle Encoding Change
  const handleEncodingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEncoding = e.target.value;
    setEncoding(newEncoding);

    // ถ้ามีไฟล์ค้างอยู่ ให้ Re-parse ทันที
    if (rawFile) {
      decodeAndParse(rawFile, newEncoding);
    }
  };

  // ** REMOVED useEffect BLOCK HERE ** // เราย้าย logic ไปไว้ใน handleFileUpload และ handleEncodingChange แล้ว

  // --- Interaction ---
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = searchSku.trim();
    if (!key) return;

    if (productDatabase[key]) {
      setCurrentData(productDatabase[key]);
      setSearchStatus("found");
      setTimeout(() => setSearchStatus("idle"), 2000);
    } else {
      setCurrentData(DEFAULT_DATA);
      setSearchStatus("not-found");
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    const textToCopy =
      fieldId === "images" ? currentData.images.join("\n") || text : text;

    navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f1f5f9;
        }
      `}</style>

      {/* 1. Top Bar: Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Logo & Status */}
            <div>
              <h1 className="text-xl font-extrabold flex items-center gap-2 text-gray-800">
                <Package className="w-6 h-6 text-blue-600" />
                Product Data Copy Station
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {dbSize > 0 ? (
                  <span className="text-green-600 font-medium">
                    ● Loaded {dbSize.toLocaleString()} products from {fileName}
                  </span>
                ) : (
                  <span className="text-orange-500">
                    ● Waiting for CSV upload...
                  </span>
                )}
              </p>
            </div>

            {/* File Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Encoding Selector */}
              <div className="relative">
                <select
                  value={encoding}
                  onChange={handleEncodingChange} // Changed to custom handler
                  className="bg-gray-50 border border-gray-300 text-xs py-2 pl-2 pr-8 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition"
                >
                  <option value="utf-8">UTF-8 (Standard)</option>
                  <option value="windows-874">
                    TIS-620 / Windows-874 (Thai)
                  </option>
                  <option value="iso-8859-1">ISO-8859-1 (Latin)</option>
                  <option value="big5">Big5 (Traditional Chinese)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <UploadCloud className="w-5 h-5" />
                Upload CSV
              </button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content and Search Bar */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex shadow-xl rounded-xl overflow-hidden bg-white border border-gray-200">
            <input
              type="text"
              placeholder={
                dbSize > 0
                  ? "Enter SKU to search (e.g., NIVEA-12345)"
                  : "Upload a CSV first to enable search"
              }
              value={searchSku}
              onChange={(e) => setSearchSku(e.target.value)}
              className="flex-1 p-4 text-base border-none focus:ring-0 focus:outline-none"
              disabled={dbSize === 0}
            />
            <button
              type="submit"
              className={`px-6 py-4 transition-all flex items-center gap-2 font-bold uppercase
                          ${
                            dbSize === 0
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
              disabled={dbSize === 0}
            >
              {searchStatus === "found" ? (
                <Check className="w-5 h-5 text-white animate-pulse" />
              ) : searchStatus === "not-found" ? (
                <AlertCircle className="w-5 h-5 text-red-300" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {searchStatus === "found"
                ? "Found"
                : searchStatus === "not-found"
                ? "Not Found"
                : "Search"}
            </button>
          </div>
          {searchStatus === "not-found" && (
            <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Product SKU "<span className="font-semibold">{searchSku}</span>"
              not found in the loaded database.
            </p>
          )}
        </form>

        {/* Initial/Empty States */}
        {dbSize === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-dashed border-gray-300">
            <UploadCloud className="w-16 h-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">
              Ready to Load Data
            </h3>
            <p className="text-gray-500 mt-2">
              Please upload a product CSV file to begin.
            </p>
          </div>
        )}

        {dbSize > 0 && currentData.sku === "" && searchStatus === "idle" && (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-dashed border-gray-300">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">
              Search for a Product
            </h3>
            <p className="text-gray-500 mt-2">
              Enter a SKU in the search bar to view and copy product details.
            </p>
          </div>
        )}

        {/* Data Display Panel */}
        {currentData.sku && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-blue-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-3">
                <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
                  <Box className="w-6 h-6" />
                  {currentData.sku}
                </h2>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 mt-2 sm:mt-0 rounded-full border border-gray-300">
                  BRAND:{" "}
                  <span className="font-semibold">
                    {currentData.brand || "N/A"}
                  </span>
                </span>
              </div>

              {/* 3. CORE METADATA */}
              <SectionHeader
                icon={DollarSign}
                title="Core Metadata & Logistics"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <CopyRow
                  label="Price (Numeric)"
                  value={currentData.price}
                  id="price"
                  highlight
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="Stock Qty (Numeric)"
                  value={currentData.stock}
                  id="stock"
                  highlight
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="Weight (g)"
                  value={currentData.weight}
                  id="weight"
                  highlight
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <div className="bg-white p-3 rounded-xl border border-blue-300 shadow-md flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dimensions (L x W x H)
                  </span>
                  <div className="text-sm font-mono text-gray-800 font-bold">
                    {currentData.l} x {currentData.w} x {currentData.h}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      cm
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. ENGLISH DATA */}
              <SectionHeader icon={FileText} title="English Content (EN)" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <CopyRow
                  label="Product Name (EN)"
                  value={currentData.nameEn}
                  id="nameEn"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="Brand ID"
                  value={currentData.brand}
                  id="brand"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              </div>
              <CopyRow
                label="Description (EN)"
                value={currentData.descEn}
                id="descEn"
                multiline
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              {/* 5. THAI DATA */}
              <SectionHeader icon={FileText} title="Thai Content (TH)" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <CopyRow
                  label="Product Name (TH)"
                  value={currentData.nameTh}
                  id="nameTh"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="SKU / Product Code"
                  value={currentData.sku}
                  id="sku"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              </div>
              <CopyRow
                label="Description (TH)"
                value={currentData.descTh}
                id="descTh"
                multiline
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              {/* 6. MEDIA ASSETS */}
              <SectionHeader icon={FileText} title="Media Assets (URLs)" />

              {/* Images */}
              <div className="mb-4">
                <CopyRow
                  label={`Image URLs (Total: ${currentData.images.length})`}
                  value={currentData.images.join("\n")}
                  id="images"
                  multiline
                  highlight={currentData.images.length > 0}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  (Copies all image URLs, each on a new line.)
                </div>
              </div>

              {/* Video */}
              <CopyRow
                label="Video URL"
                value={currentData.video}
                id="video"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        )}
      </main>

      {/* 7. Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-4 mt-8 text-center text-xs text-gray-400 border-t border-gray-200">
        Product Data Copy Station | Built with React & Tailwind CSS
      </footer>
    </div>
  );
}
