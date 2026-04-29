async function searchSessions() {
  const course = document.getElementById('searchCourse').value;
  const topic = document.getElementById('searchTopic').value;

  const res = await fetch(`/sessions/search?course=${course}&topic=${topic}`);
  const data = await res.json();

  const list = document.getElementById('results');
  list.innerHTML = '';

  data.forEach(s => {
    const li = document.createElement('li');

    li.innerHTML = `
      <strong>${s.course}</strong> - ${s.topic}<br>
      ID: ${s._id}<br>
      Members: ${s.approvedMemberIds.length}/${s.groupSize}
    `;

    list.appendChild(li);
  });
}

async function joinSession() {
  const sessionId = document.getElementById('joinSessionId').value;
  const userId = document.getElementById('joinUserId').value;

  const res = await fetch(`/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ userId })
  });

  const result = await res.json();
  document.getElementById('joinResult').innerText = JSON.stringify(result);
}