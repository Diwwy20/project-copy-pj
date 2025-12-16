import { useState } from "react";
import { DEFAULT_DATA } from "../types";
import type { ProductData } from "../types";
import { parseCSVData } from "../utils/csvParser";

export const useProductStation = () => {
  const [productDatabase, setProductDatabase] = useState<
    Record<string, ProductData>
  >({});
  const [currentData, setCurrentData] = useState<ProductData>(DEFAULT_DATA);
  const [dbSize, setDbSize] = useState(0);
  const [searchSku, setSearchSku] = useState("");
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "found" | "not-found"
  >("idle");
  const [fileName, setFileName] = useState("");
  const [encoding, setEncoding] = useState("utf-8");
  const [rawFile, setRawFile] = useState<ArrayBuffer | null>(null);

  const processFile = (buffer: ArrayBuffer, enc: string) => {
    try {
      const decoder = new TextDecoder(enc);
      const text = decoder.decode(buffer);
      const { db, count } = parseCSVData(text);
      setProductDatabase(db);
      setDbSize(count);
    } catch (error) {
      console.error("Decoding error:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setCurrentData(DEFAULT_DATA);
    setSearchSku("");
    setSearchStatus("idle");

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      setRawFile(buffer);
      processFile(buffer, encoding);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleEncodingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnc = e.target.value;
    setEncoding(newEnc);
    if (rawFile) processFile(rawFile, newEnc);
  };

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

  return {
    state: {
      currentData,
      dbSize,
      searchSku,
      searchStatus,
      fileName,
      encoding,
    },
    actions: {
      setSearchSku,
      handleFileUpload,
      handleEncodingChange,
      handleSearch,
    },
  };
};
