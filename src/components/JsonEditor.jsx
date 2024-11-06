import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { jsonParseLinter } from "@codemirror/lang-json";

export function JsonEditor({
  value,
  onChange,
  onParse,
  onSave,
  parsedJson,
  onClear,
  onCopy,
}) {
  const extensions = [json(), linter(jsonParseLinter()), lintGutter()];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Sección de entrada de JSON */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-700">JSON Input</h3>
            <button
              onClick={() => {
                onClear();
                onChange("{}"); // Resetea a "{}" al limpiar
              }}
              className="text-sm px-3 py-1 text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
            >
              Limpiar
            </button>
          </div>
          <CodeMirror
            value={value || "{}"} // Establece "{}" si el valor es vacío
            height="400px"
            extensions={extensions}
            onChange={(v) => onChange(v || "{}")} // Ajusta `onChange` para evitar el valor vacío
            className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-inner"
            theme="light"
          />
        </div>

        {/* Sección de JSON parseado */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-700">
              JSON Parseado
            </h3>
            {parsedJson && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(parsedJson, null, 2)
                  );
                  onCopy();
                }}
                className="text-sm px-3 py-1 text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
              >
                Copiar
              </button>
            )}
          </div>
          <div className="h-[400px] border-2 border-gray-200 rounded-lg overflow-auto bg-gray-50 font-mono text-sm p-4">
            {parsedJson ? (
              <pre className="text-gray-800">
                {JSON.stringify(parsedJson, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                El JSON parseado aparecerá acá
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <button
          onClick={onParse}
          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl focus:outline-none active:shadow-none"
        >
          Parsear JSON
        </button>
        <button
          onClick={onSave}
          className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl focus:outline-none active:shadow-none"
        >
          Guardar JSON
        </button>
      </div>
    </div>
  );
}
