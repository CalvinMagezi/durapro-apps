import React, { useEffect, useState } from "react";
import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import DefaultDashboardBanner from "@/components/utils/DefaultDashboardBanner";
import "react-calendar/dist/Calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface Event {
  title: string;
  start: Date;
  end: Date;
}

const localizer = momentLocalizer(moment);

function ServiceTrackingDashboard() {
  const [events, setEvents] = useState<any[]>([]);

  const { data, isLoading } = useQuery(["all_events"], async () => {
    const { data, error } = await supabase.from("servicing_event").select("*");
    if (error) {
      return [];
    }
    return data;
  });

  useEffect(() => {
    if (data) {
      const events: Event[] = data.map((event: any) => {
        return {
          title: event.title,
          start: new Date(event.starts),
          end: new Date(event.ends),
        };
      });
      setEvents(events);
    }
  }, [data]);

  console.log(events);

  return (
    <ServiceTrackingLayout>
      <DefaultDashboardBanner title="Equipment Servicing Tracking" />
      <div className="w-full h-full p-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100vh" }}
        />
      </div>
    </ServiceTrackingLayout>
  );
}

export default ServiceTrackingDashboard;
