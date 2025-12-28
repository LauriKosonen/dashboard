import * as React from "react";
import "./CalendarWidget.css"
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Badge from "@mui/material/Badge";
import { PickersDay } from '@mui/x-date-pickers/PickersDay'; 
import { styled } from '@mui/material/styles';

// Styled PickersDay to allow custom styling or props, though not strictly necessary for this logic
const CustomPickersDay = styled(PickersDay)(({ theme }) => ({
  // You can add custom styles here if you want to visually differentiate days with notes
  // For example:
  // '&.Mui-selected': {
  //   backgroundColor: theme.palette.success.light,
  // },
}));

function DayWithBadge(props) {
  const { day, dayHasNote, onClick, ...other } = props;

  const stupidDot = (
    <CustomPickersDay
      {...other}
      day={day}
      onClick={() => onClick(day)}
    />
  );

  if (!dayHasNote) return stupidDot;

  return (
    <Badge
      overlap="circular"
      variant="dot"
      color="warning"
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      {stupidDot}
    </Badge>
  );
}

export default function CalendarWidget({ notes, onNoteDateClick }) {
  const [value, setValue] = React.useState(dayjs());

  const notesByDate = React.useMemo(() => {
    const map = new Map();
    notes.forEach(note => {
      if (note.date) {
        const dateStr = dayjs(note.date).format("YYYY-MM-DD");
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr).push(note.id);
      }
    });
    return map;
  }, [notes]);


  const handleDayClick = (day) => {
    const dateStr = day.format("YYYY-MM-DD");
    const noteIdsOnThisDate = notesByDate.get(dateStr);
    if (noteIdsOnThisDate && noteIdsOnThisDate.length > 0 && onNoteDateClick) {
      onNoteDateClick(noteIdsOnThisDate[0]);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar showDaysOutsideCurrentMonth fixedWeekNumber={5}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        slots={{
          day: (dayProps) => {
            const dateStr = dayProps.day.format("YYYY-MM-DD");
            const hasNote = notesByDate.has(dateStr);
            return (
              <DayWithBadge
                {...dayProps}
                dayHasNote={hasNote}
                onClick={handleDayClick}
              />
            );
          },
        }}
      />
    </LocalizationProvider>
  );
}
