document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    creatorId: document.getElementById('creatorId').value,
    spotId: document.getElementById('spotId').value,
    course: document.getElementById('course').value,
    topic: document.getElementById('topic').value,
    sessionTime: document.getElementById('sessionTime').value,
    groupSize: document.getElementById('groupSize').value
  };

  const res = await fetch('/sessions/create', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });

  const result = await res.json();
  document.getElementById('createResult').innerText = JSON.stringify(result);
});