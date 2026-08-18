"use client";

export default function EmptyState({
  message,
  colSpan,
}: {
  message: string;
  colSpan?: number;
}) {
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-4 dark:text-gray-200">
          {message}
        </td>
      </tr>
    );
  }
  return <div className="text-gray-500 dark:text-gray-300 p-4">{message}</div>;
}