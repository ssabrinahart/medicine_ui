import { Toolbar } from "react-big-calendar";

export const CustomToolbar = (props) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button onClick={() => props.onNavigate("PREV")}>◀</button>
        <button onClick={() => props.onNavigate("TODAY")}>Today</button>
        <button onClick={() => props.onNavigate("NEXT")}>▶</button>
      </span>
      <span className="rbc-toolbar-label">{props.label}</span>
      <span className="rbc-btn-group">
        <button onClick={() => props.onView("day")}>Day</button>
        <button onClick={() => props.onView("week")}>Week</button>
      </span>
    </div>
  );
};
