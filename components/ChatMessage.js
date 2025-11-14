
import React from "react";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ from, text }) {
  const isReader = from === "reader";

  return (
    <div
      className={
        "px-4 py-3 rounded-xl max-w-[85%] " +
        (isReader
          ? "bg-purple-800/60 border border-purple-600 text-purple-100 ml-0"
          : "bg-yellow-400 text-purple-900 ml-auto"
        )
      }
    >
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="my-3 rounded-md border border-purple-700 max-w-full"
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
