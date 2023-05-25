import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Calendar.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [years, setYears] = useState([]);
  const [weekends, setWeekends] = useState([]);
  const [elements, setElements] = useState([]);
  const [currentYear, setCurrentYear] = useState(2023);
  const [newYear, setNewYear] = useState("");
  console.log(elements);

  const getYears = async () => {
    let res = await axios("http://localhost:8000/years");
    setYears(res.data);
  };

  const addWeekend = (e) => {
    e.target.setAttribute("id", String(currentDate));
    let obj = {
      date: String(currentDate),
      isWeekend: true,
    };
    axios.post("http://localhost:8000/weekends", obj);
  };

  const getWeekend = async () => {
    try {
      const response = await axios.get("http://localhost:8000/weekends");
      const weekends = response.data;
      setWeekends(weekends);

      let tds = document.querySelectorAll("td");
      setElements(tds);
      elements.forEach((item) => {
        console.log(item.id);
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getYears();
    getWeekend();
  }, []);

  const createCalendar = () => {
    const months = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];

    const daysOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

    const calendar = [];

    months.forEach((month, index) => {
      let weeks = [];
      let week = [];

      const firstDayOfMonth = new Date(currentYear, index, 1);
      const lastDayOfMonth = new Date(currentYear, index + 1, 0);
      const numDaysInMonth = lastDayOfMonth.getDate();

      for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
        week.push(
          <td
            className="inactive"
            key={`${currentYear}-${index}-empty-${i}`}
          ></td>
        );
      }

      for (let day = 1; day <= numDaysInMonth; day++) {
        const currentDate = new Date(currentYear, index, day);

        let className = "active";
        if (currentDate.getDay() >= 5) {
          className = "weekend";
        }

        week.push(
          <td
            className={className}
            key={`${currentYear}-${index}-${day}`}
            onClick={(e) => {
              addWeekend(e);
            }}
          >
            {day}
          </td>
        );

        if (currentDate.getDay() === 6 || day === numDaysInMonth) {
          weeks.push(<tr key={`${currentYear}-${index}-${day}`}>{week}</tr>);
          week = [];
        }
      }

      const tableHeader = (
        <thead>
          <tr>
            <th colSpan="7">{month}</th>
          </tr>
          <tr>
            {daysOfWeek.map((dayOfWeek) => (
              <th key={dayOfWeek}>{dayOfWeek}</th>
            ))}
          </tr>
        </thead>
      );

      const tableBody = <tbody>{weeks}</tbody>;

      calendar.push(
        <table key={`${currentYear}-${index}`}>
          {tableHeader}
          {tableBody}
        </table>
      );
    });

    async function addCalendar(calendar) {
      let obj = {
        calendar,
      };
      await axios.post("http://localhost:8000/calendar", obj);
    }
    addCalendar(calendar);
    return calendar;
  };

  const handlePrevYearClick = () => {
    console.log("work");
    if (years && years.length > 0) {
      const index = years.findIndex((item) => item.year === currentYear - 1);
      console.log(index);
      if (index !== -1) {
        setCurrentYear(years[index].year);
      }
      console.log(currentYear);
    }
  };

  const handleNextYearClick = () => {
    if (years && years.length > 0) {
      const index = years.findIndex((item) => item.year === currentYear + 1);
      if (index !== -1) {
        setCurrentYear(years[index].year);
      }
      console.log(currentYear);
    }
  };

  const handleAddYearClick = async () => {
    try {
      const response = await axios.get("http://localhost:8000/years");
      const years = response.data.years;
      const maxId = Math.max(...(years || []).map((year) => year.id));
      const result = await axios.post("http://localhost:8000/years", {
        id: maxId + 1,
        year: parseInt(newYear),
      });
      setNewYear("");
      setYears(result.data.years || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="calendar">
      <div className="addNewYear">
        <input
          type="number"
          placeholder="Год"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          defaultValue={currentYear}
        />
        <button onClick={handleAddYearClick}>Добавить</button>
      </div>
      <div className="calendar-header">
        <button onClick={handlePrevYearClick}>{"<"}</button>
        <h2>{currentYear}</h2>
        <button onClick={handleNextYearClick}>{">"}</button>
      </div>
      <div className="calendar-body">{createCalendar()}</div>
    </div>
  );
}
export default Calendar;
