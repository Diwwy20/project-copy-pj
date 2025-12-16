import { useState, useRef } from "react";
import {
  UploadCloud,
  Search,
  RefreshCw,
  FileText,
  Box,
  DollarSign,
  ChevronDown,
  AlertCircle,
  Package,
} from "lucide-react";

// Imports
import { useProductStation } from "./hooks/useProductStation";
import { CopyRow } from "./components/product/CopyRow";
import { SectionHeader } from "./components/ui/SectionHeader";
import { Footer } from "./components/layout/Footer";

export default function App() {
  const { state, actions } = useProductStation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    const textToCopy =
      fieldId === "images" ? state.currentData.images.join("\n") || text : text;

    navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
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
                {state.dbSize > 0 ? (
                  <span className="text-green-600 font-medium">
                    ● Loaded {state.dbSize.toLocaleString()} products from{" "}
                    {state.fileName}
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
              <div className="relative">
                <select
                  value={state.encoding}
                  onChange={actions.handleEncodingChange}
                  className="bg-gray-50 border border-gray-300 text-xs py-2 pl-2 pr-8 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition cursor-pointer"
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

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer border-none"
              >
                <UploadCloud className="w-5 h-5" />
                Upload CSV
              </button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={actions.handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">
        {/* Search Bar */}
        <form onSubmit={actions.handleSearch} className="mb-8">
          <div className="relative flex shadow-xl rounded-xl overflow-hidden bg-white border border-gray-200">
            <input
              type="text"
              placeholder={
                state.dbSize > 0
                  ? "Enter SKU to search (e.g., NIVEA-12345)"
                  : "Upload a CSV first to enable search"
              }
              value={state.searchSku}
              onChange={(e) => actions.setSearchSku(e.target.value)}
              className="flex-1 p-4 text-base border-none focus:ring-0 focus:outline-none"
              disabled={state.dbSize === 0}
            />
            <button
              type="submit"
              className={`px-6 py-4 transition-all flex items-center gap-2 font-bold uppercase border-none
                  ${
                    state.dbSize === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
              disabled={state.dbSize === 0}
            >
              {/* ปุ่ม Search แบบ Static ไม่เปลี่ยนข้อความตามสถานะ */}
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {/* ข้อความแจ้งเตือน Not Found สีแดงยังคงอยู่ตรงนี้ */}
          {state.searchStatus === "not-found" && (
            <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Product SKU "
              <span className="font-semibold">{state.searchSku}</span>" not
              found in the loaded database.
            </p>
          )}
        </form>

        {/* Initial/Empty States */}
        {state.dbSize === 0 && (
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

        {state.dbSize > 0 &&
          state.currentData.sku === "" &&
          state.searchStatus === "idle" && (
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
        {state.currentData.sku && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-blue-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-3">
                <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
                  <Box className="w-6 h-6" />
                  {state.currentData.sku}
                </h2>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 mt-2 sm:mt-0 rounded-full border border-gray-300">
                  BRAND:{" "}
                  <span className="font-semibold">
                    {state.currentData.brand || "N/A"}
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
                  value={state.currentData.price}
                  id="price"
                  highlight
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="Stock Qty (Numeric)"
                  value={state.currentData.stock}
                  id="stock"
                  highlight
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="Weight (g)"
                  value={state.currentData.weight}
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
                    {state.currentData.l} x {state.currentData.w} x{" "}
                    {state.currentData.h}{" "}
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
                  value={state.currentData.nameEn}
                  id="nameEn"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="Brand ID"
                  value={state.currentData.brand}
                  id="brand"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              </div>
              <CopyRow
                label="Description (EN)"
                value={state.currentData.descEn}
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
                  value={state.currentData.nameTh}
                  id="nameTh"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <CopyRow
                  label="SKU / Product Code"
                  value={state.currentData.sku}
                  id="sku"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              </div>
              <CopyRow
                label="Description (TH)"
                value={state.currentData.descTh}
                id="descTh"
                multiline
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />

              {/* 6. MEDIA ASSETS */}
              <SectionHeader icon={FileText} title="Media Assets (URLs)" />
              <div className="mb-4">
                <CopyRow
                  label={`Image URLs (Total: ${state.currentData.images.length})`}
                  value={state.currentData.images.join("\n")}
                  id="images"
                  multiline
                  highlight={state.currentData.images.length > 0}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  (Copies all image URLs, each on a new line.)
                </div>
              </div>
              <CopyRow
                label="Video URL"
                value={state.currentData.video}
                id="video"
                copiedField={copiedField}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        )}
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
