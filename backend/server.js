const http = require("http");

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        message: "Backend is running",
      })
    );
    return;
  }

  res.statusCode = 404;
  res.end(
    JSON.stringify({
      message: "Not found",
    })
  );
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
