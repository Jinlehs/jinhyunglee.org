import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  formatCurrency, formatTime, calculatePrice, FACILITY_TYPES, DAYS_OF_WEEK,
  generateSlots, getScheduleForDay, isDateAvailable, getUnavailableRanges, isSlotAvailable,
  buildLocalDT,
} from "../../lib/bookingUtils";

function Calendar({ year, month, onSelectDate, selectedDate, disabledDates, availableDates }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n) => n.toString().padStart(2, "0");
  const isAvailable = (d) => {
    if (!d) return false;
    const str = `${year}-${pad(month + 1)}-${pad(d)}`;
    const dt = new Date(str);
    if (dt < today) return false;
    return availableDates.has(str);
  };
  const isDisabled = (d) => {
    if (!d) return true;
    const str = `${year}-${pad(month + 1)}-${pad(d)}`;
    const dt = new Date(str);
    if (dt < today) return true;
    return disabledDates.has(str);
  };
  const isSelected = (d) => {
    if (!d || !selectedDate) return false;
    return selectedDate === `${year}-${pad(month + 1)}-${pad(d)}`;
  };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="fac-calendar">
      <div className="fac-cal-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="fac-cal-dow">{d}</div>
        ))}
        {cells.map((d, i) => (
          <button
            key={i}
            className={`fac-cal-day${!d ? " fac-cal-empty" : ""}${isSelected(d) ? " selected" : ""}${isAvailable(d) ? " available" : ""}${isDisabled(d) ? " disabled" : ""}`}
            disabled={!d || isDisabled(d) || !isAvailable(d)}
            onClick={() => d && isAvailable(d) && onSelectDate(`${year}-${pad(month + 1)}-${pad(d)}`)}
          >
            {d || ""}
          </button>
        ))}
      </div>
      <div className="fac-cal-legend">
        <span><span className="fac-legend-dot available" /> Available</span>
        <span><span className="fac-legend-dot disabled" /> Unavailable</span>
        <span><span className="fac-legend-dot selected" /> Selected</span>
      </div>
    </div>
  );
}

export default function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  useEffect(() => {
    async function load() {
      const [{ data: fac }, { data: sch }, { data: bks }, { data: blks }] = await Promise.all([
        supabase.from("facilities").select("*, locations(*)").eq("id", id).single(),
        supabase.from("facility_schedules").select("*").eq("facility_id", id),
        supabase.from("bookings").select("start_datetime, end_datetime").eq("facility_id", id).in("status", ["confirmed", "pending"]),
        supabase.from("facility_blocks").select("*").eq("facility_id", id),
      ]);
      setFacility(fac);
      setSchedules(sch || []);
      setBookings(bks || []);
      setBlocks(blks || []);
      setLoading(false);
    }
    load();
  }, [id]);

  // Build available/disabled date sets for calendar
  const availableDates = new Set();
  const disabledDates = new Set();
  if (!loading && facility) {
    const pad = (n) => n.toString().padStart(2, "0");
    for (let offset = 0; offset < (facility.advance_booking_days || 90); offset++) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const str = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      if (isDateAvailable(str, schedules, bookings, blocks)) {
        availableDates.add(str);
      } else {
        disabledDates.add(str);
      }
    }
  }

  // Time slots for selected date
  let daySlots = [];
  let unavailRanges = [];
  if (selectedDate && schedules.length) {
    const dow = new Date(selectedDate + "T00:00:00").getDay();
    const schedule = getScheduleForDay(schedules, dow);
    if (schedule) {
      daySlots = generateSlots(schedule.open_time, schedule.close_time);
      unavailRanges = getUnavailableRanges(selectedDate, bookings, blocks);
    }
  }

  function isStartDisabled(slot) {
    if (!selectedDate) return true;
    const slotStart = buildLocalDT(selectedDate, slot);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
    return !isSlotAvailable(slotStart, slotEnd, unavailRanges);
  }

  function isEndDisabled(slot) {
    if (!selectedStart || !selectedDate) return true;
    const startDT = buildLocalDT(selectedDate, selectedStart);
    const endDT = buildLocalDT(selectedDate, slot);
    if (endDT <= startDT) return true;
    const minEnd = new Date(startDT.getTime() + (facility?.min_booking_hours || 1) * 60 * 60 * 1000);
    const maxEnd = new Date(startDT.getTime() + (facility?.max_booking_hours || 8) * 60 * 60 * 1000);
    if (endDT < minEnd || endDT > maxEnd) return true;
    return !isSlotAvailable(startDT, endDT, unavailRanges);
  }

  function handleBook() {
    if (!selectedDate || !selectedStart || !selectedEnd) return;
    navigate(`/facilities/${id}/book`, {
      state: {
        facilityId: id,
        facilityName: facility.name,
        locationName: facility.locations?.name,
        selectedDate,
        selectedStart,
        selectedEnd,
      },
    });
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  if (loading) return <div className="fac-loading-full">Loading facility…</div>;
  if (!facility) return <div className="fac-loading-full">Facility not found.</div>;

  const amenities = JSON.parse(facility.amenities || "[]");
  const typeLabel = FACILITY_TYPES.find((t) => t.value === facility.facility_type)?.label || facility.facility_type;

  const scheduleDays = schedules.filter((s) => s.active).map((s) => ({
    ...s,
    dayName: DAYS_OF_WEEK[s.day_of_week],
    open: formatTime(s.open_time),
    close: formatTime(s.close_time),
  })).sort((a, b) => a.day_of_week - b.day_of_week);

  // Price estimate for selection
  let priceEstimate = null;
  if (selectedDate && selectedStart && selectedEnd) {
    const startDT = buildLocalDT(selectedDate, selectedStart).toISOString();
    const endDT = buildLocalDT(selectedDate, selectedEnd).toISOString();
    priceEstimate = calculatePrice(facility, startDT, endDT);
  }

  return (
    <div className="facilities-page">
      <div className="fac-detail-header">
        <div className="fac-container">
          <Link to="/facilities/browse" className="fac-back">← Back to Facilities</Link>
          <div className="fac-detail-meta">
            <span className="fac-card-type">{typeLabel}</span>
            {facility.requires_approval && (
              <span className="fac-card-approval">Requires Admin Approval</span>
            )}
          </div>
          <h1 className="fac-detail-title">{facility.name}</h1>
          <p className="fac-detail-location">
            📍 {facility.locations?.name} · {facility.locations?.address}, {facility.locations?.city}, {facility.locations?.state}
          </p>
        </div>
      </div>

      <div className="fac-container fac-detail-body">
        <div className="fac-detail-main">
          <section className="fac-detail-section">
            <h2 className="fac-detail-sec-title">About This Space</h2>
            <p className="fac-detail-desc">{facility.description}</p>
          </section>

          <section className="fac-detail-section">
            <h2 className="fac-detail-sec-title">Amenities & Equipment</h2>
            <div className="fac-amenities-grid">
              {amenities.map((a, i) => (
                <div key={i} className="fac-amenity-item">
                  <span className="fac-amenity-check">✓</span> {a}
                </div>
              ))}
            </div>
          </section>

          <section className="fac-detail-section">
            <h2 className="fac-detail-sec-title">Pricing</h2>
            <div className="fac-pricing-grid">
              <div className="fac-price-tier">
                <span className="fac-price-tier-label">Hourly Rate</span>
                <span className="fac-price-tier-value">{formatCurrency(facility.hourly_rate)}</span>
              </div>
              {facility.half_day_rate && (
                <div className="fac-price-tier">
                  <span className="fac-price-tier-label">Half Day (4 hrs)</span>
                  <span className="fac-price-tier-value">{formatCurrency(facility.half_day_rate)}</span>
                </div>
              )}
              {facility.full_day_rate && (
                <div className="fac-price-tier">
                  <span className="fac-price-tier-label">Full Day (8 hrs)</span>
                  <span className="fac-price-tier-value">{formatCurrency(facility.full_day_rate)}</span>
                </div>
              )}
            </div>
            <p className="fac-price-note">
              Min. {facility.min_booking_hours} hr{facility.min_booking_hours > 1 ? "s" : ""} · Max. {facility.max_booking_hours} hrs · Book up to {facility.advance_booking_days} days ahead
            </p>
          </section>

          <section className="fac-detail-section">
            <h2 className="fac-detail-sec-title">Regular Availability</h2>
            {scheduleDays.length === 0 ? (
              <p className="fac-detail-no-sched">No regular schedule set. Contact us for availability.</p>
            ) : (
              <div className="fac-schedule-list">
                {scheduleDays.map((s) => (
                  <div key={s.id} className="fac-schedule-row">
                    <span className="fac-schedule-day">{s.dayName}</span>
                    <span className="fac-schedule-time">{s.open} – {s.close}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Booking Panel */}
        <aside className="fac-booking-panel">
          <div className="fac-booking-card">
            <h3 className="fac-booking-card-title">Check Availability</h3>

            <div className="fac-cal-nav">
              <button className="fac-cal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="fac-cal-nav-label">{MONTH_NAMES[calMonth]} {calYear}</span>
              <button className="fac-cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            <Calendar
              year={calYear}
              month={calMonth}
              selectedDate={selectedDate}
              availableDates={availableDates}
              disabledDates={disabledDates}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setSelectedStart(null);
                setSelectedEnd(null);
              }}
            />

            {selectedDate && daySlots.length > 0 && (
              <div className="fac-slot-section">
                <label className="fac-filter-label">Start Time</label>
                <div className="fac-slot-grid">
                  {daySlots.map((slot) => (
                    <button
                      key={slot}
                      className={`fac-slot-btn${selectedStart === slot ? " selected" : ""}${isStartDisabled(slot) ? " disabled" : ""}`}
                      disabled={isStartDisabled(slot)}
                      onClick={() => { setSelectedStart(slot); setSelectedEnd(null); }}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>

                {selectedStart && (
                  <>
                    <label className="fac-filter-label" style={{ marginTop: "1rem" }}>End Time</label>
                    <div className="fac-slot-grid">
                      {daySlots.filter((s) => {
                        const sdt = buildLocalDT(selectedDate, s);
                        const startDT = buildLocalDT(selectedDate, selectedStart);
                        return sdt > startDT;
                      }).map((slot) => (
                        <button
                          key={slot}
                          className={`fac-slot-btn${selectedEnd === slot ? " selected" : ""}${isEndDisabled(slot) ? " disabled" : ""}`}
                          disabled={isEndDisabled(slot)}
                          onClick={() => setSelectedEnd(slot)}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedDate && selectedStart && selectedEnd && (
              <div className="fac-booking-summary">
                <div className="fac-booking-sum-row">
                  <span>Date</span>
                  <span>{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                </div>
                <div className="fac-booking-sum-row">
                  <span>Time</span>
                  <span>{formatTime(selectedStart)} – {formatTime(selectedEnd)}</span>
                </div>
                {priceEstimate !== null && (
                  <div className="fac-booking-sum-row fac-booking-sum-price">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(priceEstimate)}</span>
                  </div>
                )}
                <button className="fac-btn-primary fac-btn-full" onClick={handleBook}>
                  Reserve This Time →
                </button>
              </div>
            )}

            {selectedDate && daySlots.length === 0 && (
              <p className="fac-no-slots">No available slots on this date.</p>
            )}

            <div className="fac-booking-capacity">
              <span>👥 Capacity: up to {facility.capacity.toLocaleString()} guests</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
