using { managed } from '@sap/cds/common';

namespace coffeex.jobs;

entity SchedulerJobs : managed {
  key job        : String(50);
      handler    : String(100);
      nextRun    : DateTime;
      intervalMs : Integer;
      enabled    : Boolean default true;
  lastRun        : DateTime;
  lastStatus     : String(20) enum { SUCCESS; FAILED; RUNNING; };
} 