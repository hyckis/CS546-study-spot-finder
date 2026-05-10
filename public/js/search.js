window.addEventListener("DOMContentLoaded", async () => {
  await loadRecommendedSessions();
});

function createSessionListItem(s) {
  const li = document.createElement("li");
  const course = document.createElement("strong");
  course.textContent = s.course;

  li.appendChild(course);
  li.appendChild(document.createTextNode(` - ${s.topic}`));
  li.appendChild(document.createElement("br"));
  li.appendChild(document.createTextNode(`Session ID: ${s._id}`));
  li.appendChild(document.createElement("br"));
  li.appendChild(document.createTextNode(`Spot ID: ${s.spotId}`));
  li.appendChild(document.createElement("br"));
  li.appendChild(document.createTextNode(
      `Time: ${new Date(s.sessionTime).toLocaleString()}`
  ));
  li.appendChild(document.createElement("br"));
  li.appendChild(document.createTextNode(
      `Members: ${s.approvedMemberIds.length}/${s.groupSize}`
  ));
  li.appendChild(document.createElement("br"));
  li.appendChild(document.createTextNode(`Status: ${s.status}`));
  li.appendChild(document.createElement("br"));

  const joinBtn = document.createElement("button");
  joinBtn.textContent = "Join This Session";
  joinBtn.addEventListener("click", () => {
    joinSessionById(s._id);
  });
  li.appendChild(joinBtn);

  return li;
}

async function loadRecommendedSessions() {
  const userMajorInput = document.getElementById("userMajor");
  const userMajor = userMajorInput ? userMajorInput.value.trim() : "";

  const params = new URLSearchParams();

  if (userMajor) {
    params.append("course", userMajor);
  }

  params.append("openOnly", "true");

  const res = await fetch(`/sessions/search?${params.toString()}`);
  const data = await res.json();

  const list = document.getElementById("recommendedResults");
  list.innerHTML = "";

  if (data.error) {
    list.innerHTML = `<li>${data.error}</li>`;
    return;
  }

  if (data.length === 0) {
    list.innerHTML = "<li>No recommended sessions found.</li>";
    return;
  }

  data.forEach((s) => {
    list.appendChild(createSessionListItem(s));
  });
}

async function searchSessions() {
  const course = document.getElementById("searchCourse").value.trim();
  const topic = document.getElementById("searchTopic").value.trim();

  const params = new URLSearchParams();

  if (course) {
    params.append("course", course);
  }

  if (topic) {
    params.append("topic", topic);
  }

  params.append("openOnly", "true");

  const res = await fetch(`/sessions/search?${params.toString()}`);
  const data = await res.json();

  const list = document.getElementById("results");
  list.innerHTML = "";

  if (data.error) {
    list.innerHTML = `<li>${data.error}</li>`;
    return;
  }

  if (data.length === 0) {
    list.innerHTML = "<li>No sessions found.</li>";
    return;
  }

  data.forEach((s) => {
    list.appendChild(createSessionListItem(s));
  });
}

async function joinSessionById(sessionId) {
  const res = await fetch(`/sessions/${sessionId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin"
  });

  const result = await res.json();

  document.getElementById("joinResult").innerText = result.error
    ? result.error
    : result.message;
}

async function joinSession() {
  const sessionId = document.getElementById("joinSessionId").value.trim();

  if (!sessionId) {
    document.getElementById("joinResult").innerText = "Please enter a session ID";
    return;
  }

  await joinSessionById(sessionId);
}