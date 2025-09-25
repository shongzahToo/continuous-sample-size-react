import { useState } from "react";
import "./FileInputButton.css";
import * as XLSX from "xlsx/xlsx.mjs";

export default function FileInputButton({
  onFile,
  onStats,
  label = "Upload data file",
}) {
  const inputId = `file-input`;
  const [fileName, setFileName] = useState("");

  const toNum = (cell) => {
    if (cell == null || cell === "") return NaN;
    const n =
      typeof cell === "number"
        ? cell
        : Number(String(cell).replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const isNumericLike = (cell) => Number.isFinite(toNum(cell));

  const computeStats = (nums) => {
    const values = nums.filter((v) => Number.isFinite(v));
    const count = values.length;
    if (count === 0) {
      return { mean: NaN, variance: NaN, stdev: NaN, sum: 0, count };
    }
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const sq = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
    const variance = sq / count;
    const stdev = Math.sqrt(variance);
    return { mean, variance, stdev, sum, count };
  };

  const autoExtractSingleColumn = (sheet2D) => {
    const rows = sheet2D.filter(
      (r) => Array.isArray(r) && r.some((c) => c != null && String(c) !== "")
    );
    if (rows.length === 0) return { values: [], columnKey: null, headerRow: -1 };

    const width = Math.max(...rows.map((r) => r.length));

    const colCounts = Array.from({ length: width }, (_, c) =>
      rows.reduce((acc, r) => {
        const v = r[c];
        return acc + (v != null && String(v) !== "" ? 1 : 0);
      }, 0)
    );

    let bestCol = 0;
    let bestCount = -1;
    for (let c = 0; c < width; c++) {
      if (colCounts[c] > bestCount) {
        bestCount = colCounts[c];
        bestCol = c;
      }
    }

    const colCells = rows.map((r) => r[bestCol]);
    const firstIdx = colCells.findIndex(
      (v) => v != null && String(v) !== ""
    );
    if (firstIdx === -1) return { values: [], columnKey: null, headerRow: -1 };

    const firstCell = colCells[firstIdx];
    const tail = colCells.slice(firstIdx + 1).filter((v) => v != null && String(v) !== "");
    const numericTailCount = tail.filter(isNumericLike).length;
    const headerLikely =
      !isNumericLike(firstCell) && numericTailCount >= Math.ceil(tail.length * 0.6);

    const headerRow = headerLikely ? firstIdx : -1;
    const startRow = headerLikely ? firstIdx + 1 : firstIdx;

    const values = colCells.slice(startRow).map(toNum);
    const rawHeader = headerLikely ? firstCell : null;

    const columnKey =
      headerLikely && rawHeader != null && String(rawHeader).trim() !== ""
        ? String(rawHeader)
        : `col_${bestCol}`;

    return { values, columnKey, headerRow };
  };

  const parseWorkbookAndEmit = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });

      const chosenSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[chosenSheetName];
      if (!ws) throw new Error(`Sheet "${chosenSheetName}" not found`);

      const sheet2D = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
      if (!sheet2D || sheet2D.length === 0) {
        throw new Error("Sheet appears to be empty");
      }

      const { values, columnKey, headerRow } = autoExtractSingleColumn(sheet2D);
      const stats = computeStats(values);

      onStats?.({
        ...stats,
        sheetName: chosenSheetName,
        columnKey,
        headerRow,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || "");
    onFile?.(file, e);
    if (file) await parseWorkbookAndEmit(file);
  };

  const clearFile = () => {
    const input = document.getElementById(inputId);
    if (input) input.value = "";
    setFileName("");
    onFile?.(null, null);
  };

  return (
    <div className="fd-file-upload">
      <label className="fd-file-label" htmlFor={inputId} aria-label={label}>
        <input
          id={inputId}
          type="file"
          className="fd-file-input"
          onChange={handleChange}
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        />
        <span className="fd-file-btn" aria-hidden="true">
          <svg className="fd-file-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 4a3.5 3.5 0 0 1 2.475 5.975l-6.36 6.36a2.5 2.5 0 1 1-3.536-3.536l5.3-5.3a1 1 0 1 1 1.414 1.414l-5.3 5.3a.5.5 0 0 0 .707.707l6.36-6.36A1.5 1.5 0 0 0 14.5 6h-5a1 1 0 1 1 0-2h5z" />
          </svg>
          Choose file
        </span>
        <span className={`fd-file-name ${fileName ? "has-file" : ""}`}>
          {fileName || "XLSX/XLS only"}
        </span>
      </label>

      {fileName && (
        <button
          type="button"
          className="fd-file-clear"
          onClick={clearFile}
          aria-label="Clear selected file"
        >
          Clear
        </button>
      )}
    </div>
  );
}