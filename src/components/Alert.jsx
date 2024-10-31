import React from "react";

export function Alert({ type, message }) {
  const styles = {
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-700",
      icon: "text-red-500",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-700",
      icon: "text-green-500",
    },
  }[type];

  return (
    <div
      className={`${styles.bg} border-l-4 ${styles.border} p-4 rounded-lg shadow-md`}
    >
      <div className="flex items-center">
        {type === "error" ? (
          <svg
            className={`w-5 h-5 ${styles.icon} mr-2`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className={`w-5 h-5 ${styles.icon} mr-2`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        <p className={styles.text}>{message}</p>
      </div>
    </div>
  );
}
