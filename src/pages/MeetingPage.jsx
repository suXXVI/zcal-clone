import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ListGroup, Button } from 'react-bootstrap';
import { eachDayOfInterval, isWeekend, addMonths } from 'date-fns';

function MeetingPage() {
  const startDate = new Date();
  const endDate = addMonths(startDate, 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate }).filter(date => !isWeekend(date));

  const [availability] = useState(dateRange.map(date => ({
    "date": date.toISOString().split('T')[0],
    "start_time": "09:00",
    "end_time": "17:00",
    "repeats": "all weekdays"
  })));
  const [selectedDate, setSelectedDate] = useState(startDate);

  const getTimeSlots = (date) => {
    const availabilityForDate = availability.find(a => new Date(a.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]);

    if (!availabilityForDate) {
      return null;
    }

    const startTime = parseInt(availabilityForDate.start_time.split(':')[0]);
    const endTime = parseInt(availabilityForDate.end_time.split(':')[0]);

    const timeSlots = [];
    for (let i = startTime; i < endTime; i++) {
      timeSlots.push(`${i}:00`);
      timeSlots.push(`${i}:30`);
    }

    return timeSlots;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const isDateDisabled = ({ date, view }) => {
    if (view === 'month' && !availability.find(a => new Date(a.date).toISOString().split('T')[0] === date.toISOString().split('T')[0])) {
      return true;
    }

    return false;
  };

  const handleTimeSlotClick = (timeSlot) => {
    console.log(`Selected time slot: ${timeSlot}`);
  };

  const timeSlots = getTimeSlots(selectedDate);

  return (
    <div>
      <h1>Meeting Page</h1>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileDisabled={isDateDisabled}
      />
      {timeSlots && (
        <div>
          <h2>Available Time Slots</h2>
          <ListGroup>
            {timeSlots.map((timeSlot, index) => (
              <ListGroup.Item key={index} action>
                <Button variant="link" onClick={() => handleTimeSlotClick(timeSlot)}>
                  {timeSlot}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
}

export default MeetingPage;
