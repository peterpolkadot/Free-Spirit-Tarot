
export default function ChatMessage({ from, text }) {
  const isReader = from === "reader";

  return (
    <div className={
      "flex w-full my-3 " +
      (isReader ? "justify-start" : "justify-end")
    }>
      <div
        className={
          "max-w-xs rounded-xl px-4 py-3 shadow-md whitespace-pre-line " +
          (isReader
            ? "bg-purple-800/60 border border-purple-700 text-purple-100"
            : "bg-yellow-400 text-purple-900 font-medium")
        }
      >
        {text}
      </div>
    </div>
  );
}
