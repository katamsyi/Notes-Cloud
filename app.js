// const BASE_URL = "http://localhost:5000"; // Sesuaikan sesuai backend lokal
const BASE_URL = "https://be-notes-371739253078.us-central1.run.app";

let selectedNoteId = null;

// Fungsi utama untuk memanggil saat halaman sudah siap
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "auth.html";
    return;
  }

  loadNotes();

  // Event listener tombol
  document.getElementById("add-note").addEventListener("click", prepareNewNote);
  document.getElementById("save-note").addEventListener("click", saveNewNote);
  document.getElementById("update-note").addEventListener("click", updateNote);
  document.getElementById("delete-note").addEventListener("click", deleteNote);

  document.getElementById("logout-btn")?.addEventListener("click", logout);
});

// Logout function
async function logout() {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout request gagal", err);
  }
  localStorage.removeItem("accessToken");
  alert("Logout berhasil");
  window.location.href = "auth.html";
}

// Fungsi pembungkus fetch untuk auto refresh token saat expired
async function fetchWithRefresh(url, options = {}) {
  let token = localStorage.getItem("accessToken");
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${token}`;
  options.credentials = "include"; // agar cookie refresh token ikut terkirim

  let response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    // coba refresh token
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.accessToken);

      // ulangi request asli dengan token baru
      options.headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(url, options);
    } else {
      alert("Session habis, silakan login ulang");
      localStorage.removeItem("accessToken");
      window.location.href = "auth.html";
    }
  }

  return response;
}

// Load semua catatan dan tampilkan judulnya
async function loadNotes() {
  try {
    const response = await fetchWithRefresh(`${BASE_URL}/notes`);

    if (!response.ok) {
      alert("Gagal memuat catatan");
      return;
    }

    const notes = await response.json();
    displayNoteTitles(notes);
  } catch (error) {
    console.error("Failed to retrieve data:", error);
  }
}

// Tampilkan daftar judul catatan di sidebar
function displayNoteTitles(notes) {
  const notesList = document.getElementById("notes-list");
  notesList.innerHTML = "";

  notes.forEach((note) => {
    const noteItem = document.createElement("li");
    noteItem.textContent = note.judul_Catatan; // sesuaikan nama properti
    noteItem.classList.add("note-item");
    noteItem.addEventListener("click", () => loadNoteDetails(note.id_Catatan));
    notesList.appendChild(noteItem);
  });
}

// Reset form tambah catatan baru
function prepareNewNote() {
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").value = "";
  document.getElementById("save-note").style.display = "block";
  document.getElementById("update-note").style.display = "none";
  document.getElementById("delete-note").style.display = "none";
  selectedNoteId = null;
}

// Simpan catatan baru ke backend
async function saveNewNote() {
  const judul_Catatan = document.getElementById("note-title").value.trim();
  const deskripsi_Catatan = document
    .getElementById("note-content")
    .value.trim();

  if (!judul_Catatan || !deskripsi_Catatan) {
    alert("Title and description are required");
    return;
  }

  try {
    const response = await fetchWithRefresh(`${BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul_Catatan, deskripsi_Catatan }),
    });

    if (response.ok) {
      alert("Note has been saved!");
      loadNotes();
      resetNoteDetails();
    } else {
      alert("Failed to save note");
    }
  } catch (error) {
    console.error("Note could not be saved:", error);
  }
}

// Load detail catatan berdasar id dan tampilkan di form
async function loadNoteDetails(noteId) {
  try {
    const response = await fetchWithRefresh(`${BASE_URL}/notes/${noteId}`);

    if (!response.ok) {
      alert("Gagal memuat detail catatan");
      return;
    }

    const note = await response.json();

    document.getElementById("note-title").value = note.judul_Catatan;
    document.getElementById("note-content").value = note.deskripsi_Catatan;

    document.getElementById("save-note").style.display = "none";
    document.getElementById("update-note").style.display = "block";
    document.getElementById("delete-note").style.display = "block";

    selectedNoteId = note.id_Catatan;
  } catch (error) {
    console.error("Failed to retrieve note details", error);
  }
}

// Update catatan ke backend
async function updateNote() {
  if (!selectedNoteId) {
    alert("Select a note!");
    return;
  }

  const judul_Catatan = document.getElementById("note-title").value.trim();
  const deskripsi_Catatan = document
    .getElementById("note-content")
    .value.trim();

  if (!judul_Catatan || !deskripsi_Catatan) {
    alert("Title and description are required");
    return;
  }

  try {
    const response = await fetchWithRefresh(
      `${BASE_URL}/notes/${selectedNoteId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul_Catatan, deskripsi_Catatan }),
      }
    );

    if (response.ok) {
      alert("Note updated!");
      loadNotes();
    } else {
      alert("Could not update the note");
    }
  } catch (error) {
    console.error("Could not update the note", error);
  }
}

// Hapus catatan di backend
async function deleteNote() {
  if (!selectedNoteId) {
    alert("Select a note!");
    return;
  }

  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    const response = await fetchWithRefresh(
      `${BASE_URL}/notes/${selectedNoteId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      alert("Note has been deleted!");
      loadNotes();
      resetNoteDetails();
    } else {
      alert("Could not delete the note");
    }
  } catch (error) {
    console.error("Could not delete the note", error);
  }
}

// Reset form input catatan dan tombol
function resetNoteDetails() {
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").value = "";
  document.getElementById("save-note").style.display = "none";
  document.getElementById("update-note").style.display = "block";
  document.getElementById("delete-note").style.display = "block";
  selectedNoteId = null;
}
