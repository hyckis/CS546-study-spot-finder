document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    spotId: document.getElementById("spotId").value.trim(),
    course: document.getElementById("course").value.trim(),
    topic: document.getElementById("topic").value.trim(),
    sessionTime: document.getElementById("sessionTime").value,
    groupSize: document.getElementById("groupSize").value
  };

  if (!data.spotId) {
    document.getElementById("createResult").innerText =
      "Please select a study spot.";
    return;
  }

  if (!course || !course.trim()) {
    errorDiv.textContent = "Course is required.";
    return;
  }

  if (!topic || !topic.trim()) {
    errorDiv.textContent = "Topic is required.";
    return;
  }

  if (!sessionTime) {
    errorDiv.textContent = "Session time is required.";
    return;
  }

  if (!groupSize || isNaN(Number(groupSize)) || Number(groupSize) < 1) {
    errorDiv.textContent = "Group size must be at least 1.";
    return;
  }

  const res = await fetch("/sessions/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.error) {
    document.getElementById("createResult").innerText = result.error;
  } else {
    document.getElementById("createResult").innerText =
      "Session created successfully";

    document.getElementById("createForm").reset();
  }
});