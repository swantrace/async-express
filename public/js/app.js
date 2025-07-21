// Basic client-side JavaScript
console.log("Task Manager app loaded");

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Add authorization header to fetch requests
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const token = getCookie("token");
  if (token && args[1]) {
    args[1].headers = {
      ...args[1].headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return originalFetch.apply(this, args);
};
