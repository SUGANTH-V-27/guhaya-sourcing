"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type CalendarState = {
  input: HTMLInputElement;
  value: string;
  month: Date;
  rect: DOMRect;
};

const pad = (value: number) => String(value).padStart(2, "0");

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (year && month && day) return new Date(year, month - 1, day);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function sameDay(left: Date, right: Date) {
  return formatDate(left) === formatDate(right);
}

export function ThemedDatePicker() {
  const [calendar, setCalendar] = useState<CalendarState | null>(null);
  const suppressInputClick = useRef(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement;
      const input = target.closest("input[type='date']") as HTMLInputElement | null;
      const insideCalendar = Boolean(target.closest("[data-themed-calendar]"));

      if (!input && !insideCalendar) {
        setCalendar(null);
        return;
      }

      if (!input || input.disabled || input.readOnly) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      suppressInputClick.current = true;
      const date = parseDate(input.value);
      setCalendar({ input, value: input.value, month: date, rect: input.getBoundingClientRect() });
    }

    function suppressNativeClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const input = target.closest("input[type='date']") as HTMLInputElement | null;
      if (!input || !suppressInputClick.current) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      suppressInputClick.current = false;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setCalendar(null);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", suppressNativeClick, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", suppressNativeClick, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const days = useMemo(() => {
    if (!calendar) return [];
    const first = new Date(calendar.month.getFullYear(), calendar.month.getMonth(), 1);
    const start = new Date(calendar.month.getFullYear(), calendar.month.getMonth(), 1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [calendar]);

  if (!calendar) return null;

  const monthLabel = calendar.month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const selectedDate = calendar.value ? parseDate(calendar.value) : null;
  const today = new Date();
  const top = Math.min(calendar.rect.bottom + 8, window.innerHeight - 350);
  const left = Math.min(calendar.rect.left, window.innerWidth - 292);

  function moveMonth(amount: number) {
    setCalendar((current) => current ? {
      ...current,
      month: new Date(current.month.getFullYear(), current.month.getMonth() + amount, 1),
    } : null);
  }

  function chooseDate(date: Date) {
    const value = formatDate(date);
    const activeCalendar = calendar;
    if (!activeCalendar) return;
    const input = activeCalendar.input;
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    descriptor?.set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    setCalendar(null);
  }

  return (
    <div
      data-themed-calendar
      className="fixed z-[100] w-[276px] rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-gray-200 shadow-2xl shadow-black/50"
      style={{ top, left }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month" className="rounded-lg p-2 text-gray-400 hover:bg-black hover:text-[#00BFA5]"><ChevronLeft size={17} /></button>
        <strong className="text-sm font-semibold text-white">{monthLabel}</strong>
        <button type="button" onClick={() => moveMonth(1)} aria-label="Next month" className="rounded-lg p-2 text-gray-400 hover:bg-black hover:text-[#00BFA5]"><ChevronRight size={17} /></button>
      </div>
      <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day.slice(0, 2)}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = day.getMonth() === calendar.month.getMonth();
          const selected = selectedDate && sameDay(day, selectedDate);
          const isToday = sameDay(day, today);
          return (
            <button
              type="button"
              key={formatDate(day)}
              onClick={() => chooseDate(day)}
              className={`h-8 rounded-lg text-xs transition ${inMonth ? "text-gray-200" : "text-gray-600"} ${selected ? "bg-[#00BFA5] font-bold text-black" : "hover:bg-black hover:text-[#00BFA5]"} ${isToday && !selected ? "ring-1 ring-[#00BFA5]/60" : ""}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
