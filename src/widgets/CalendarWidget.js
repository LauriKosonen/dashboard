import * as React from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Badge from "@mui/material/Badge";
import { PickersDay } from '@mui/x-date-pickers/PickersDay'; // Import PickersDay
import { styled } from '@mui/material/styles'; // Import styled for custom PickersDay

// Styled PickersDay to allow custom styling or props, though not strictly necessary for this logic
const CustomPickersDay = styled(PickersDay)(({ theme }) => ({
  // You can add custom styles here if you want to visually differentiate days with notes
  // For example:
  // '&.Mui-selected': {
  //   backgroundColor: theme.palette.success.light,
  // },
}));

// Custom Day component to be used in slots.day
// This component wraps PickersDay and adds the Badge and click functionality
function DayWithBadge(props) {
  const { day, dayHasNote, onClick, ...other } = props;

  return (
    <Badge
      key={day.toString()} // Ensure a unique key for the badge
      overlap="circular"
      badgeContent={dayHasNote ? "•" : undefined} // Display a small dot for notes
      color="primary"
      // You can adjust badge position with anchorOrigin if needed
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <CustomPickersDay
        {...other}
        day={day}
        onClick={() => onClick(day)} // Attach click handler to the day cell
      />
    </Badge>
  );
}

export default function CalendarWidget({ notes, onNoteDateClick }) { // Add onNoteDateClick prop
  const [value, setValue] = React.useState(dayjs());

  // Create a map of dates (YYYY-MM-DD) to an array of note IDs for efficient lookup
  const notesByDate = React.useMemo(() => {
    const map = new Map();
    notes.forEach(note => {
      if (note.date) {
        const dateStr = dayjs(note.date).format("YYYY-MM-DD");
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr).push(note.id); // Store note IDs
      }
    });
    return map;
  }, [notes]);

  // Handler for when a day on the calendar is clicked
  const handleDayClick = (day) => {
    const dateStr = day.format("YYYY-MM-DD");
    const noteIdsOnThisDate = notesByDate.get(dateStr);
    if (noteIdsOnThisDate && noteIdsOnThisDate.length > 0 && onNoteDateClick) {
      // If there are notes for the clicked day, call the callback with the first note's ID.
      // You could extend this to show a list of notes if multiple are present on a single day.
      onNoteDateClick(noteIdsOnThisDate[0]); // Pass the ID of the first note found for that day
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={value}
        onChange={(newValue) => setValue(newValue)}
        // Use the `DayWithBadge` component for rendering each day cell
        slots={{
          day: (dayProps) => {
            const dateStr = dayProps.day.format("YYYY-MM-DD");
            const hasNote = notesByDate.has(dateStr);
            return (
              <DayWithBadge
                {...dayProps}
                dayHasNote={hasNote} // Pass a boolean indicating if the day has notes
                onClick={handleDayClick} // Pass the click handler
              />
            );
          },
        }}
        // Add onMonthChange if you want to update the calendar view based on note dates
        // For simplicity, not included here, but could be useful for large datasets.
      />
    </LocalizationProvider>
  );
}
