// Availability and booking calculation utilities

export function generateBookingRef() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BK-${year}-${rand}`;
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDateTime(dt) {
  return new Date(dt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Returns duration in hours (decimal) between two datetime strings
export function getDurationHours(startDT, endDT) {
  return (new Date(endDT) - new Date(startDT)) / (1000 * 60 * 60);
}

// Compute booking price given facility rates and duration
export function calculatePrice(facility, startDT, endDT) {
  const hours = getDurationHours(startDT, endDT);
  if (hours <= 0) return 0;

  // Full day (8+ hours)
  if (hours >= 8 && facility.full_day_rate) return facility.full_day_rate;
  // Half day (4+ hours)
  if (hours >= 4 && facility.half_day_rate) return facility.half_day_rate;
  // Hourly
  return Math.ceil(hours) * facility.hourly_rate;
}

// Apply a promo code and return discount amount
export function applyPromoCode(promoCode, subtotal) {
  if (!promoCode) return 0;
  if (promoCode.discount_type === "percentage") {
    return (subtotal * promoCode.discount_value) / 100;
  }
  return Math.min(promoCode.discount_value, subtotal);
}

// Check if two time ranges overlap
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Get the schedule entry for a given day-of-week (0=Sun)
export function getScheduleForDay(schedules, dayOfWeek) {
  return schedules.find((s) => s.day_of_week === dayOfWeek && s.active) || null;
}

// Build a local datetime string from a date string + time string
export function buildLocalDT(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

// Generate 30-minute time slots within open/close window
export function generateSlots(openTime, closeTime) {
  const slots = [];
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  let h = oh;
  let m = om;
  while (h * 60 + m + 30 <= ch * 60 + cm) {
    const label = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    slots.push(label);
    m += 30;
    if (m >= 60) { h++; m -= 60; }
  }
  return slots;
}

// Check if a date has any available slots given bookings and blocks
export function isDateAvailable(dateStr, schedules, bookings, blocks) {
  const d = new Date(dateStr + "T00:00:00");
  const dow = d.getDay();
  const schedule = getScheduleForDay(schedules, dow);
  if (!schedule) return false;

  const dayStart = new Date(dateStr + "T" + schedule.open_time + ":00");
  const dayEnd = new Date(dateStr + "T" + schedule.close_time + ":00");

  // Check if the entire schedule window is blocked
  const allBlocked = [...bookings, ...blocks].some((b) => {
    const bStart = new Date(b.start_datetime);
    const bEnd = new Date(b.end_datetime);
    return bStart <= dayStart && bEnd >= dayEnd;
  });

  return !allBlocked;
}

// Get unavailable slot ranges for a date (blocked or booked)
export function getUnavailableRanges(dateStr, bookings, blocks) {
  const ranges = [];
  const dayStr = dateStr.substring(0, 10);
  [...bookings, ...blocks].forEach((item) => {
    const s = new Date(item.start_datetime);
    const e = new Date(item.end_datetime);
    // Only include if the item overlaps this date
    const dayStart = new Date(dayStr + "T00:00:00");
    const dayEnd = new Date(dayStr + "T23:59:59");
    if (s < dayEnd && e > dayStart) {
      ranges.push({ start: s, end: e });
    }
  });
  return ranges;
}

// Check if a proposed start+end slot is available
export function isSlotAvailable(proposedStart, proposedEnd, unavailableRanges) {
  const pStart = typeof proposedStart === "string" ? new Date(proposedStart) : proposedStart;
  const pEnd = typeof proposedEnd === "string" ? new Date(proposedEnd) : proposedEnd;
  return !unavailableRanges.some(({ start, end }) =>
    rangesOverlap(pStart, pEnd, start, end)
  );
}

export const FACILITY_TYPES = [
  { value: "gymnasium", label: "Gymnasium" },
  { value: "auditorium", label: "Auditorium / Theatre" },
  { value: "cafeteria", label: "Cafeteria / Dining" },
  { value: "library", label: "Library / Media Center" },
  { value: "classroom", label: "Classroom / Meeting Room" },
  { value: "field", label: "Outdoor Field / Track" },
  { value: "multipurpose", label: "Multipurpose Room" },
];

export const EVENT_TYPES = [
  { value: "sports", label: "Sports / Athletics" },
  { value: "performance", label: "Performance / Concert" },
  { value: "meeting", label: "Meeting / Conference" },
  { value: "community", label: "Community Event" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "celebration", label: "Celebration / Party" },
  { value: "class", label: "Class / Workshop / Training" },
  { value: "other", label: "Other" },
];

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const BLOCK_TYPES = [
  { value: "maintenance", label: "Maintenance" },
  { value: "holiday", label: "Holiday / School Event" },
  { value: "reserved", label: "Reserved" },
  { value: "other", label: "Other" },
];
