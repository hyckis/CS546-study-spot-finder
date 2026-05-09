window.addEventListener("DOMContentLoaded", async () => {
  await loadManagePage();
});

async function loadManagePage() {
  const message = document.getElementById("manageMessage");

  const res = await fetch("/sessions/manage/data", {
    credentials: "same-origin"
  });

  const data = await res.json();

  if (data.error) {
    message.innerText = data.error;
    return;
  }

  renderJoinedSessions(data.joinedSessions);
  renderCreatedSessions(data.createdSessions);
  renderInvitedSessions(data.invitedSessions);
}

function renderJoinedSessions(sessions) {
  const list = document.getElementById("joinedSessions");
  list.innerHTML = "";

  if (!sessions || sessions.length === 0) {
    list.innerHTML = "<li>You have not joined any sessions.</li>";
    return;
  }

  sessions.forEach((s) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${s.course}</strong> - ${s.topic}<br>
      Session ID: ${s._id}<br>
      Time: ${new Date(s.sessionTime).toLocaleString()}<br>
      Status: ${s.status}<br>
      <button onclick="quitSession('${s._id}')">Quit Session</button>
    `;

    list.appendChild(li);
  });
}

function renderCreatedSessions(sessions) {
  const list = document.getElementById("createdSessions");
  list.innerHTML = "";

  if (!sessions || sessions.length === 0) {
    list.innerHTML = "<li>You have not created any sessions.</li>";
    return;
  }

  sessions.forEach((s) => {
    const li = document.createElement("li");

    let pendingHtml = "";

    if (s.pendingMemberIds && s.pendingMemberIds.length > 0) {
      pendingHtml = "<p>Pending Join Requests:</p><ul>";

      s.pendingMemberIds.forEach((userId) => {
        pendingHtml += `
          <li>
            User ID: ${userId}
            <button onclick="approveUser('${s._id}', '${userId}')">Approve</button>
            <button onclick="rejectUser('${s._id}', '${userId}')">Reject</button>
          </li>
        `;
      });

      pendingHtml += "</ul>";
    } else {
      pendingHtml = "<p>No pending join requests.</p>";
    }

    li.innerHTML = `
      <strong>${s.course}</strong> - ${s.topic}<br>
      Session ID: ${s._id}<br>
      Time: ${new Date(s.sessionTime).toLocaleString()}<br>
      Members: ${s.approvedMemberIds.length}/${s.groupSize}<br>
      Status: ${s.status}<br>

      ${pendingHtml}

      <label for="invite-${s._id}">Invite User Email:</label>
      <input type="email" id="invite-${s._id}" placeholder="student@example.com">
      <button onclick="inviteUser('${s._id}')">Invite</button>

      <br>
      <button onclick="disbandSession('${s._id}')">Disband Session</button>
    `;

    list.appendChild(li);
  });
}

function renderInvitedSessions(sessions) {
  const list = document.getElementById("invitedSessions");
  list.innerHTML = "";

  if (!sessions || sessions.length === 0) {
    list.innerHTML = "<li>You have no invitations.</li>";
    return;
  }

  sessions.forEach((s) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${s.course}</strong> - ${s.topic}<br>
      Session ID: ${s._id}<br>
      Time: ${new Date(s.sessionTime).toLocaleString()}<br>
      Status: ${s.status}<br>
      <button onclick="acceptInvitation('${s._id}')">Accept Invitation</button>
      <button onclick="declineInvitation('${s._id}')">Decline Invitation</button>
    `;

    list.appendChild(li);
  });
}

async function quitSession(sessionId) {
  await postAction(`/sessions/${sessionId}/quit`);
}

async function disbandSession(sessionId) {
  await postAction(`/sessions/${sessionId}/disband`);
}

async function approveUser(sessionId, userId) {
  await postAction(`/sessions/${sessionId}/approve`, { userId });
}

async function rejectUser(sessionId, userId) {
  await postAction(`/sessions/${sessionId}/reject`, { userId });
}

async function inviteUser(sessionId) {
  const invitedEmail = document.getElementById(`invite-${sessionId}`).value.trim();

  if (!invitedEmail) {
    document.getElementById("manageMessage").innerText =
      "Please enter an email to invite.";
    return;
  }

  await postAction(`/sessions/${sessionId}/invite`, { invitedEmail });
}

async function acceptInvitation(sessionId) {
  await postAction(`/sessions/${sessionId}/invite/accept`);
}

async function declineInvitation(sessionId) {
  await postAction(`/sessions/${sessionId}/invite/decline`);
}

async function postAction(url, body = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body)
  });

  const result = await res.json();

  document.getElementById("manageMessage").innerText = result.error
    ? result.error
    : result.message;

  await loadManagePage();
}