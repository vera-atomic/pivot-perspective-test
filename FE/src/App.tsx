import { useRef, useEffect } from "react";
import perspective from "@finos/perspective";

import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";
import "@finos/perspective-viewer-d3fc";
import { HTMLPerspectiveViewerElement } from "@finos/perspective-viewer";

import "./App.css";

// Adjust the config based on your dataset columns
const config = {
  group_by: ["location", "sku"], // Groups rows first by location, then by SKU
  split_by: ["order_placed_date"], // Splits columns by date (month/year) and channel
  columns: ["quantity"], // Specifies which columns to show
  aggregates: {
    quantity: "sum", // Aggregate quantity by summing
    location: "distinct count", // Keep a distinct count for location
    sku: "distinct count", // Keep a distinct count for SKU
    channel: "distinct count", // Keep a distinct count for channels
    order_placed_date: "distinct count", // For grouping by order date
  },
  sort: [
    ["order_placed_date", "asc"], // Optionally, you can specify sorting, if needed
  ],
  row_pivots: ["location"],
};

// Function to fetch and return a Perspective table
const getTable = async () => {
  const worker = await perspective.worker(); // Create a Perspective worker

  // Fetch the dataset CSV
  const response = await fetch("/demand.csv");
  const csvText = await response.text(); // Read the CSV as text

  // Use worker to parse CSV and create a Perspective table
  return await worker.table(csvText);
};

function App() {
  // Create a ref to the Perspective Viewer element
  const viewer = useRef<HTMLPerspectiveViewerElement>(null);

  useEffect(() => {
    const loadTable = async () => {
      try {
        const table = await getTable(); // Get the Perspective table
        if (table && viewer.current) {
          await viewer.current.load(table).then(async () => {
            const regular_table = document.querySelector("perspective-viewer-datagrid").shadowRoot?.querySelector("regular-table");
            // @ts-ignore
            regular_table.addStyleListener(() => {
              const ths = regular_table.querySelectorAll("thead th");
              ths.forEach((th: HTMLElement) => {
                th.style.minWidth = "200px";
                th.style.width = "200px";
              });
              const trs = regular_table.querySelectorAll("#psp-column-titles");
              trs.forEach((tr: HTMLElement) => {
                tr.style.display = "none";
              });
            });
          });
          await viewer.current.restore(config); // Restore the desired configuration
        }
      } catch (error) {
        console.error("Error loading table:", error);
      }
    };

    loadTable(); // Call loadTable on mount
  }, []);

  return (
    <div className="App">
      {/* Add ref to Perspective Viewer */}
      <perspective-viewer ref={viewer}></perspective-viewer>
    </div>
  );
}

export default App;
