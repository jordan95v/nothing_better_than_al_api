const promBundle = require("express-prom-bundle");

export const metricsMiddleware = promBundle({ includeMethod: true });
