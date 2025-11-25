import React, { useState, useRef, useEffect } from 'react';

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
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const formatted = formatDisplayDate(date);
      setDisplayDate(formatted);
      setInputValue(formatted);
      setCurrentMonth(date);
    } else {
      setDisplayDate('');
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatInputDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
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
      const date = new Date(input);
      if (!isNaN(date.getTime())) return date;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Auto-format as user types
    const formatted = formatInputAsTyping(input);
    setInputValue(formatted);

    // Try to parse the input as a complete date
    if (formatted.length === 10) { // DD-MM-YYYY complete
      const parsedDate = parseInputDate(formatted);
      if (parsedDate) {
        const formattedDate = formatInputDate(parsedDate);
        onChange(formattedDate);
        setCurrentMonth(parsedDate);
      }
    }
  };

  const handleInputBlur = () => {
    // If input is invalid, revert to the last valid value
    if (value) {
      const date = new Date(value);
      const formatted = formatDisplayDate(date);
      setInputValue(formatted);
    } else {
      setInputValue('');
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = formatInputDate(selectedDate);
    onChange(formattedDate);
    const displayFormatted = formatDisplayDate(selectedDate);
    setDisplayDate(displayFormatted);
    setInputValue(displayFormatted);
    setIsOpen(false);
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
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
    const selectedDate = new Date(value);
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
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          className="date-picker-input"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />
        <div className="date-picker-icon" onClick={() => !disabled && setIsOpen(!isOpen)}>
          📅
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              ◀
            </button>
            <div className="month-year-display">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => navigateMonth(1)}
            >
              ▶
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
                const formattedDate = formatInputDate(today);
                onChange(formattedDate);
                const displayFormatted = formatDisplayDate(today);
                setDisplayDate(displayFormatted);
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
                setDisplayDate('');
                setInputValue('');
                setIsOpen(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};