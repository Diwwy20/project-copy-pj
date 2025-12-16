# 📦 Product Data Copy Station

> **A streamlined utility tool for E-commerce operations.** > Upload bulk CSV product data, search by SKU, and instantly copy formatted metadata, descriptions, and media assets for cross-platform listing.

## ✨ Key Features

- 🚀 **Client-Side Parsing:** Process large CSV files instantly within the browser (no server upload required).
- 🔍 **SKU Search:** Quickly find products using their SKU or Parent SKU.
- 📋 **One-Click Copy:** Copy prices, stock, descriptions, or bulk image URLs to clipboard with a single click.
- 🇹🇭 **Encoding Support:** Full support for **UTF-8** and **TIS-620 (Windows-874)** for Thai language compatibility.
- 📱 **Responsive Design:** Optimized for both desktop and tablet workflows.
- 🏗️ **Clean Architecture:** Built with separation of concerns (Hooks, Utils, UI Components).

## 🛠️ Tech Stack

- **Core:** [React](https://reactjs.org/) (v19) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Diwwy20/project-copy-pj
   cd product-copy-station
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
---

## 📂 Project Structure
This project follows a scalable folder structure:

```
src/
├── components/         # UI Components
│   ├── ui/         # Generic UI elements (SectionHeader, etc.)
│   ├── layout/         # Layout components (Footer, etc.)
│   ├── product/        # Product-specific components (CopyRow, etc.)            
├── hooks/              # Custom React Hooks (Business Logic)
├── types/              # TypeScript Interfaces
├── utils/              # Pure functions (CSV Parsing helpers)
├── App.tsx             # Main Application Entry
└── index.css           # Global Styles & Tailwind Directives
```

---

## 📊 Supported CSV Format
The application automatically detects headers based on keywords. Ensure your CSV contains columns matching these patterns:
| Target Field | Supported Header Keywords (Case-insensitive) |
| :--- | :--- |
| **SKU** | `SKU`, `Parent SKU`, `parent_sku`, `parent_sku_code` |
| **Name (EN)** | `Product Name (EN)`, `product_name` |
| **Name (TH)** | `Product Name (TH)`, `product_name_th` |
| **Description (EN)** | `Product Description (EN)`, `product_description`
| **Description (TH)** | `Product Description (TH)`, `product_description_th` |
| **Price** | `Price`, `Normal Price`, `normal_price` |
| **Stock** | `Stock`, `Quantity`, `stock` |
| **Weight** | `Weight`, `net_weight` |
| **Dimensions** | `Width`, `Length`, `Height`, `package_width`, `package_length`, `package_height` |
| **Images** | Any header containing `Image` or `Cover Image` (e.g., `Image 1`, `Cover Image`) |
| **Video** | `Video`, `Video URL`, `video_url` |

---

## 🌍 Live Demo

You can try Quote Hub instantly — no setup needed!
👉 [https://project-copy-pj.netlify.app/](https://project-copy-pj.netlify.app/)
