// src/App.jsx
import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { JsonEditor } from "./components/JsonEditor";
import { HistoryList } from "./components/HistoryList";
import { TabButton } from "./components/TabButton";
import { Alert } from "./components/Alert";
import { FaGithub } from "react-icons/fa";

export function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [parsedJson, setParsedJson] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    const savedHistory = localStorage.getItem("jsonHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Modificación aquí: Manejar la Promise correctamente
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
      setError(err.message);
      setParsedJson(null);
    }
  };

  const handleSave = () => {
    if (!parsedJson) {
      setError("Por favor, parsea el JSON antes de guardar");
      return;
    }

    const newEntry = {
      timestamp: new Date().toISOString(),
      data: parsedJson,
    };

    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    localStorage.setItem("jsonHistory", JSON.stringify(updatedHistory));

    setError(null);
    setSuccess("JSON guardado exitosamente");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem("jsonHistory", JSON.stringify(updatedHistory));

    setSuccess("JSON eliminado exitosamente");
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
                window.electronAPI.openExternalLink(
                  "https://github.com/JoaquimColacilli"
                );
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
                  onCopy={() => {
                    setSuccess("JSON copiado al portapapeles");
                    setTimeout(() => setSuccess(null), 3000);
                  }}
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
