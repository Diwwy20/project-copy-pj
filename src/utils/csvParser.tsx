import type { ProductData } from "../types";
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

export const parseCSVData = (csvText: string) => {
  const lines = csvText.split(/\r\n|\n/);

  let headerRowIndex = -1;
  let headers: string[] = [];

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
    return { db: {}, count: 0 };
  }

  const newDb: Record<string, ProductData> = {};
  let count = 0;

  const getIdx = (keywords: string[]) =>
    headers.findIndex(
      (h) =>
        h && keywords.some((k) => h.toLowerCase().trim() === k.toLowerCase())
    );

  const idxMap = {
    sku: getIdx(["Parent SKU", "SKU", "parent_sku", "parent_sku_code"]),
    nameEn: getIdx(["Product Name (EN)", "product_name"]),
    nameTh: getIdx(["Product Name (TH)", "product_name_th"]),
    descEn: getIdx(["Product Description (EN)", "product_description"]),
    descTh: getIdx(["Product Description (TH)", "product_description_th"]),
    brand: getIdx(["Brand ID", "Brand", "brand_id"]),
    price: getIdx(["Normal Price", "Price", "normal_price"]),
    stock: getIdx(["Stock", "stock", "quantity"]),
    weight: getIdx(["Weight", "weight", "net_weight"]),
    l: getIdx(["Length", "length", "package_length"]),
    w: getIdx(["Width", "width", "package_width"]),
    h: getIdx(["Height", "height", "package_height"]),
    video: getIdx(["Video", "Video URL", "video_url"]),
  };

  const imgIndices: number[] = [];
  headers.forEach((h, idx) => {
    if (h && /cover image|image |image_/i.test(h)) imgIndices.push(idx);
  });

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const row = parseCSVLine(line);

    if (row.length <= idxMap.sku) continue;
    const sku = row[idxMap.sku]?.trim();

    if (sku) {
      const imgs = imgIndices
        .map((idx) => row[idx])
        .filter((url) => url && url.trim().length > 0);

      newDb[sku] = {
        sku,
        nameEn: row[idxMap.nameEn] || "",
        nameTh: row[idxMap.nameTh] || "",
        descEn: row[idxMap.descEn] || "",
        descTh: row[idxMap.descTh] || "",
        brand: row[idxMap.brand] || "",
        price: (row[idxMap.price] || "0").replace(/[^\d.]/g, ""),
        stock: (row[idxMap.stock] || "0").replace(/[^\d.]/g, ""),
        weight: (row[idxMap.weight] || "0").replace(/[^\d.]/g, ""),
        l: (row[idxMap.l] || "0").replace(/[^\d.]/g, ""),
        w: (row[idxMap.w] || "0").replace(/[^\d.]/g, ""),
        h: (row[idxMap.h] || "0").replace(/[^\d.]/g, ""),
        video: row[idxMap.video] || "",
        images: imgs,
      };
      count++;
    }
  }

  return { db: newDb, count };
};
