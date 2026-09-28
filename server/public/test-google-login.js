async function handleCredentialResponse(response) {
  const res = await fetch("http://localhost:5000/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ credential: response.credential }),
  });
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
}

document.getElementById("me-btn").addEventListener("click", async () => {
  const res = await fetch("http://localhost:5000/api/auth/me", {
    credentials: "include",
  });
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  const res = await fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
});