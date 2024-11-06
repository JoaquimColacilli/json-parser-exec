// src/App.jsx
import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { JsonEditor } from "./components/JsonEditor";
import { HistoryList } from "./components/HistoryList";
import { TabButton } from "./components/TabButton";
import { Alert } from "./components/Alert";
import { FaGithub } from "react-icons/fa";

export function App() {
  const [input, setInput] = useState("{}");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [parsedJson, setParsedJson] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    // Cargar los JSONs desde los archivos
    if (window.electronAPI && window.electronAPI.loadJSONs) {
      window.electronAPI.loadJSONs().then((result) => {
        if (result.success) {
          // Ordenar por fecha descendente
          const sortedHistory = result.jsons.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setHistory(sortedHistory);
        } else {
          setError("Error al cargar los JSONs: " + result.error);
        }
      });
    }

    if (window.electronAPI && window.electronAPI.getAppVersion) {
      window.electronAPI.getAppVersion().then((version) => {
        setAppVersion(version);
      });
    }

    if (window.electronAPI) {
      window.electronAPI.onUpdateAvailable(() => {
        setSuccess("¡Nueva versión disponible! Se está descargando...");
      });

      window.electronAPI.onUpdateDownloaded(() => {
        setSuccess(
          "¡Actualización descargada! Reinicia la aplicación para instalarla."
        );
        setUpdateAvailable(true);
      });
    }
  }, []);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(input);
      setParsedJson(parsed);
      setError(null);
    } catch (err) {
      setError("Error al parsear el JSON: " + err.message);
      setParsedJson(null);
    }
  };

  const handleSave = () => {
    if (!parsedJson) {
      setError("Por favor, parsea el JSON antes de guardar");
      return;
    }

    if (window.electronAPI && window.electronAPI.saveJSON) {
      window.electronAPI.saveJSON(parsedJson).then((result) => {
        if (result.success) {
          // Agregar el nuevo JSON al historial
          const newEntry = {
            filename: result.filename,
            data: parsedJson,
            timestamp: new Date().toISOString(),
          };
          setHistory([newEntry, ...history]);

          setError(null);
          setSuccess("JSON guardado exitosamente");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError("Error al guardar el JSON: " + result.error);
        }
      });
    }
  };

  const handleDelete = (filename) => {
    if (window.electronAPI && window.electronAPI.deleteJSON) {
      window.electronAPI.deleteJSON(filename).then((result) => {
        if (result.success) {
          // Remover el JSON del historial
          const updatedHistory = history.filter(
            (entry) => entry.filename !== filename
          );
          setHistory(updatedHistory);

          setSuccess("JSON eliminado exitosamente");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError("Error al eliminar el JSON: " + result.error);
        }
      });
    }
  };

  const handleCopy = () => {
    setSuccess("JSON copiado al portapapeles");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleInstallUpdate = () => {
    if (window.electronAPI) {
      window.electronAPI.restartApp();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-emerald-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Parser de JSON{" "}
            {appVersion && (
              <span className="text-sm text-gray-600">v{appVersion}</span>
            )}
          </h1>
          <p className="text-gray-600">
            Valida, formatea y guarda tus JSONs fácilmente
          </p>
          <div className="flex justify-center items-center mt-4">
            <span className="text-gray-600 mr-2">by Joaquim Colacilli</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (window.electronAPI) {
                  window.electronAPI.openExternalLink(
                    "https://github.com/JoaquimColacilli"
                  );
                }
              }}
              className="hover:text-gray-800"
            >
              <FaGithub className="text-gray-600 w-4 h-4" />
            </a>
          </div>
          {updateAvailable && (
            <button
              onClick={handleInstallUpdate}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Instalar actualización
            </button>
          )}
        </div>

        <Tab.Group>
          <Tab.List className="flex space-x-2 rounded-xl bg-white p-2 shadow-lg mb-8">
            <TabButton>Nuevo JSON</TabButton>
            <TabButton>Historial</TabButton>
          </Tab.List>

          <div className="mb-4">
            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}
          </div>

          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white rounded-xl shadow-xl p-8">
                <JsonEditor
                  value={input}
                  onChange={(value) => {
                    setInput(value);
                    setError(null);
                    setParsedJson(null);
                  }}
                  onParse={handleParse}
                  onSave={handleSave}
                  parsedJson={parsedJson}
                  onClear={() => {
                    setInput("");
                    setParsedJson(null);
                    setSuccess("JSON limpiado exitosamente");
                    setTimeout(() => setSuccess(null), 3000);
                  }}
                  onCopy={() => {
                    setSuccess("JSON copiado al portapapeles");
                    setTimeout(() => setSuccess(null), 3000);
                  }}
                />
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white rounded-xl shadow-xl p-8">
                <HistoryList
                  history={history}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
