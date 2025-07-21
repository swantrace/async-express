import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`� Tasks: http://localhost:${PORT}/tasks`);
  console.log(`🔐 Login: http://localhost:${PORT}/auth/login`);
  console.log(`📝 API Docs: http://localhost:${PORT}/api`);
});
