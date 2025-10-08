// -------- Data --------

// 1) Staff list -> populates staff dropdown
const staffList = [
  { id: 1, name: "Ahmed Ali" },
  { id: 2, name: "Sara N." },
  { id: 3, name: "Yousef K." },
];

// 2) Days of week -> populates day dropdown
const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// 3) Route plans: one plan per (staff, day) with >= 5 customers
//    You can add more plans as needed.
const routePlans = [
  {
    staff: 1,
    day: "Monday",
    customers: [
      { customer: 101, lat: 24.7136, lng: 46.6753 }, // Riyadh center (start)
      { customer: 102, lat: 24.7743, lng: 46.7386 },
      { customer: 103, lat: 24.7890, lng: 46.6420 },
      { customer: 104, lat: 24.6761, lng: 46.6856 },
      { customer: 105, lat: 24.7749, lng: 46.7386 }, // end (example)
    ],
  },
  {
    staff: 2,
    day: "Wednesday",
    customers: [
      { customer: 201, lat: 21.4858, lng: 39.1925 }, // Jeddah (start)
      { customer: 202, lat: 21.5433, lng: 39.1728 },
      { customer: 203, lat: 21.5600, lng: 39.2010 },
      { customer: 204, lat: 21.5708, lng: 39.2184 },
      { customer: 205, lat: 21.4890, lng: 39.2210 }, // end
    ],
  },
  {
    staff: 3,
    day: "Sunday",
    customers: [
      { customer: 301, lat: 26.4207, lng: 50.0888 }, // Dammam (start)
      { customer: 302, lat: 26.4344, lng: 50.1030 },
      { customer: 303, lat: 26.3927, lng: 50.1955 },
      { customer: 304, lat: 26.3398, lng: 50.1660 },
      { customer: 305, lat: 26.4202, lng: 50.1167 }, // end
    ],
  },
];

// -------- DOM Elements --------
const staffSelect = document.getElementById("staffSelect");
const daySelect = document.getElementById("daySelect");
const buildBtn = document.getElementById("buildBtn");
const alertBox = document.getElementById("alertBox");
const resultDiv = document.getElementById("result");

// -------- Populate dropdowns --------
function populateStaff() {
  staffList.forEach(s => {
    const opt = document.createElement("option");
    opt.value = String(s.id);
    opt.textContent = `${s.id} — ${s.name}`;
    staffSelect.appendChild(opt);
  });
}

function populateDays() {
  daysOfWeek.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    daySelect.appendChild(opt);
  });
}

populateStaff();
populateDays();

// -------- Helpers --------
function showAlert(type, msg) {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = msg;
  alertBox.classList.remove("d-none");
}

function clearAlert() {
  alertBox.className = "alert d-none";
  alertBox.textContent = "";
}

function findPlan(staffId, day) {
  const sid = Number(staffId);
  return routePlans.find(p => p.staff === sid && p.day === day);
}

function buildGoogleMapsLink(customers) {
  // Use first as origin, last as destination, middle as waypoints
  const origin = customers[0];
  const destination = customers[customers.length - 1];
  const middle = customers.slice(1, -1);

  // Google Maps Directions URL:
  // https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng&waypoints=lat,lng|lat,lng
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  const waypointsStr = middle.map(c => `${c.lat},${c.lng}`).join("|");

  const params = new URLSearchParams({
    api: "1",
    origin: originStr,
    destination: destStr,
    travelmode: "driving",
  });

  if (middle.length > 0) {
    params.set("waypoints", waypointsStr);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// -------- Click handler --------
buildBtn.addEventListener("click", () => {
  clearAlert();
  resultDiv.innerHTML = "";

  const staffVal = staffSelect.value.trim();
  const dayVal = daySelect.value.trim();

  // Basic validation
  if (!staffVal || !dayVal) {
    showAlert("warning", "Please select both a staff member and a day.");
    return;
  }

  // Find plan
  const plan = findPlan(staffVal, dayVal);
  if (!plan) {
    showAlert("danger", "No route plan found for the selected staff and day.");
    return;
  }

  // Validate customers length
  if (!Array.isArray(plan.customers) || plan.customers.length < 2) {
    showAlert("danger", "The plan must contain at least 2 customers to build a route.");
    return;
  }

  // Safety: Google Maps link supports up to 23 waypoints — total customers <= 25
  if (plan.customers.length > 25) {
    showAlert("warning", "Too many customers for one link. Please reduce to 25 or fewer.");
    return;
  }

  const url = buildGoogleMapsLink(plan.customers);

  // Render result link
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "btn btn-outline-success";
  a.textContent = "Open route in Google Maps";
  resultDiv.appendChild(a);

  // Also show a compact preview list
  const ul = document.createElement("ul");
  ul.className = "mt-3 list-group";
  plan.customers.forEach((c, idx) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    const role =
      idx === 0 ? "Start" :
      idx === plan.customers.length - 1 ? "End" : "Stop";
    li.textContent = `${role} — Customer ${c.customer}: (${c.lat}, ${c.lng})`;
    ul.appendChild(li);
  });
  resultDiv.appendChild(ul);
});
