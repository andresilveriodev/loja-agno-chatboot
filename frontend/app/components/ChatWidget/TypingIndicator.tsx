export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-primary-100 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
