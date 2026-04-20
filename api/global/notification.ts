export const connectNotification = (userId: string) => {
  const eventSource = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/notifications/subscribe/${userId}`
  );

  eventSource.addEventListener("notification", (event) => {
    const data = JSON.parse(event.data);
    alert(data.message);
  });

  eventSource.onerror = (error) => {
    console.error("SSE error", error);
  };

  return eventSource;
};
