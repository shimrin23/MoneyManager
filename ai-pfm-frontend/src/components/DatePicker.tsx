import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { getLocalDateString, parseLocalDateString } from '../utils/date';
import './DatePicker.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  label,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  className = "",
  inputClassName = "",
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearUp, setYearUp] = useState(false);
  const [monthUp, setMonthUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const monthListRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (value) {
      const parsedDate = parseInputDate(value);
      if (parsedDate) {
        const formatted = formatDisplayDate(parsedDate);
        setInputValue(formatted);
        setCurrentMonth(parsedDate);
      } else {
        setInputValue('');
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    // Capture phase so a click that a React handler stops from bubbling still closes the picker
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setYearOpen(false);
      setMonthOpen(false);
    }
  }, [isOpen]);

  // Centre the selected year and month once when their lists open, so later re-renders do not reset the user's scroll
  useLayoutEffect(() => {
    const el = yearListRef.current;
    const current = el?.querySelector('.year-option.on') as HTMLElement | null;
    if (el && current) el.scrollTop = current.offsetTop - el.clientHeight / 2 + current.clientHeight / 2;
  }, [yearOpen]);

  useLayoutEffect(() => {
    const el = monthListRef.current;
    const current = el?.querySelector('.year-option.on') as HTMLElement | null;
    if (el && current) el.scrollTop = current.offsetTop - el.clientHeight / 2 + current.clientHeight / 2;
  }, [monthOpen]);

  // The dropdown is portalled to body so modal containers (overflow: auto) cannot clip it
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = (event?: Event) => {
      // Scrolling inside the dropdown (the year list) must not re-render and reset its scroll position
      if (event && dropdownRef.current?.contains(event.target as Node)) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight ?? 340;
      const dropdownWidth = dropdownRef.current?.offsetWidth ?? 300;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight + 8 && rect.top > spaceBelow;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - dropdownWidth - 8));

      setDropdownStyle(openUp
        ? { position: 'fixed', left, top: 'auto', bottom: window.innerHeight - rect.top + 8, zIndex: 10000 }
        : { position: 'fixed', left, top: rect.bottom + 8, bottom: 'auto', zIndex: 10000 });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const formatDisplayDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatInputDate = (date: Date): string => {
    return getLocalDateString(date);
  };

  const parseInputDate = (input: string): Date | null => {
    // Try DD-MM-YYYY format first
    const ddmmyyyy = input.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }

    // Try DD/MM/YYYY format
    const ddmmyyyySlash = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyySlash) {
      const [, day, month, year] = ddmmyyyySlash;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }

    // Try YYYY-MM-DD format
    const yyyymmdd = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
      const normalizedInput = `${yyyymmdd[1]}-${yyyymmdd[2].padStart(2, '0')}-${yyyymmdd[3].padStart(2, '0')}`;
      const parsed = parseLocalDateString(normalizedInput);
      if (parsed) return parsed;
    }

    // Fallback for ISO timestamps (e.g., from backend)
    const fallbackDate = new Date(input);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }

    return null;
  };

  const formatInputAsTyping = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format as DD-MM-YYYY while typing
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
  };

  const isWithinDateRange = (date: Date): boolean => {
    const selectedDate = formatInputDate(date);
    if (minDate && selectedDate < minDate) return false;
    if (maxDate && selectedDate > maxDate) return false;
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Auto-format as user types
    const formatted = formatInputAsTyping(input);
    setInputValue(formatted);

    // Try to parse the input as a complete date
    if (formatted.length === 10) { // DD-MM-YYYY complete
      const parsedDate = parseInputDate(formatted);
      if (parsedDate && isWithinDateRange(parsedDate)) {
        const formattedDate = formatInputDate(parsedDate);
        onChange(formattedDate);
        setCurrentMonth(parsedDate);
      }
    }
  };

  const handleInputBlur = () => {
    // If input is invalid, revert to the last valid value
    if (value) {
      const parsedDate = parseInputDate(value);
      if (parsedDate) {
        const formatted = formatDisplayDate(parsedDate);
        setInputValue(formatted);
      } else {
        setInputValue('');
      }
    } else {
      setInputValue('');
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isWithinDateRange(selectedDate)) {
      return;
    }
    const formattedDate = formatInputDate(selectedDate);
    onChange(formattedDate);
    const displayFormatted = formatDisplayDate(selectedDate);
    setInputValue(displayFormatted);
    setIsOpen(false);
  };

  const navigateMonth = (direction: number) => {
    // Start from the 1st so a 31st does not overflow into the following month (e.g. 31 Jan + 1 month)
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Get previous month's last days to fill empty cells
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    // Add days from previous month (dimmed)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isPrevMonth: true,
        isNextMonth: false,
        isCurrentMonth: false
      });
    }
    
    // Add all days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        isPrevMonth: false,
        isNextMonth: false,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill remaining cells (make it 6 weeks = 42 cells)
    const totalCells = 42; // 6 rows × 7 columns
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day: day,
        isPrevMonth: false,
        isNextMonth: true,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const isToday = (dayObj: any): boolean => {
    if (!dayObj.isCurrentMonth) return false;
    const today = new Date();
    return (
      dayObj.day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (dayObj: any): boolean => {
    if (!dayObj.isCurrentMonth || !value) return false;
    const selectedDate = parseInputDate(value);
    if (!selectedDate) return false;
    return (
      dayObj.day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`date-picker-container ${className}`} ref={containerRef}>
      {label && (
        <label className="date-picker-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      <div className="date-picker-input-container">
        <input
          id={id}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`date-picker-input ${inputClassName}`}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />
        <div className="date-picker-icon" onClick={() => !disabled && setIsOpen(!isOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
      </div>

      {isOpen && !disabled && createPortal(
        <div className="date-picker-dropdown" ref={dropdownRef} style={dropdownStyle}>
          <div className="date-picker-header">
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div className="month-year-selects">
              <div className="month-picker">
                <button
                  type="button"
                  className="month-select"
                  onClick={(e) => {
                    setMonthUp(window.innerHeight - e.currentTarget.getBoundingClientRect().bottom < 240);
                    setMonthOpen(!monthOpen);
                    setYearOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={monthOpen}
                  aria-label="Month"
                >
                  {monthNames[currentMonth.getMonth()]}
                </button>
                {monthOpen && (
                  <div className={`month-list${monthUp ? " up" : ""}`} role="listbox" ref={monthListRef}>
                    {monthNames.map((name, i) => (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={i === currentMonth.getMonth()}
                        className={`year-option ${i === currentMonth.getMonth() ? 'on' : ''}`}
                        onClick={() => {
                          setCurrentMonth(prev => new Date(prev.getFullYear(), i, 1));
                          setMonthOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="year-picker">
                <button
                  type="button"
                  className="year-trigger"
                  onClick={(e) => {
                    setYearUp(window.innerHeight - e.currentTarget.getBoundingClientRect().bottom < 240);
                    setYearOpen(!yearOpen);
                    setMonthOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={yearOpen}
                  aria-label="Year"
                >
                  {currentMonth.getFullYear()}
                </button>
                {yearOpen && (
                  <div
                    className={`year-list${yearUp ? " up" : ""}`}
                    role="listbox"
                    ref={yearListRef}
                  >
                    {Array.from({ length: 201 }, (_, i) => currentMonth.getFullYear() - 100 + i).map(y => (
                      <button
                        key={y}
                        type="button"
                        role="option"
                        aria-selected={y === currentMonth.getFullYear()}
                        className={`year-option ${y === currentMonth.getFullYear() ? 'on' : ''}`}
                        onClick={() => {
                          setCurrentMonth(prev => new Date(y, prev.getMonth(), 1));
                          setYearOpen(false);
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => navigateMonth(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <div className="date-picker-calendar">
            <div className="weekdays">
              {weekDays.map(day => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {getDaysInMonth().map((dayObj, index) => (
                <div key={index} className="calendar-cell">
                  <button
                    type="button"
                    className={`calendar-day ${
                      dayObj.isCurrentMonth ? '' : 'other-month'
                    } ${isToday(dayObj) ? 'today' : ''} ${isSelected(dayObj) ? 'selected' : ''}`}
                    onClick={() => {
                      if (dayObj.isCurrentMonth) {
                        handleDateSelect(dayObj.day);
                      } else if (dayObj.isPrevMonth) {
                        navigateMonth(-1);
                      } else if (dayObj.isNextMonth) {
                        navigateMonth(1);
                      }
                    }}
                  >
                    {dayObj.day}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="date-picker-footer">
            <button
              type="button"
              className="today-btn"
              onClick={() => {
                const today = new Date();
                if (!isWithinDateRange(today)) {
                  return;
                }
                const formattedDate = formatInputDate(today);
                onChange(formattedDate);
                const displayFormatted = formatDisplayDate(today);
                setInputValue(displayFormatted);
                setIsOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                onChange('');
                setInputValue('');
                setIsOpen(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
