import { getCurrentEnv } from '../environment';

let telemetryLogger: oteljs.TelemetryLogger;

class OfficeJsSink implements oteljs.TelemetrySink {
  sendTelemetryEvent(event: oteljs.TelemetryEvent) {
    (Office as any).sendTelemetryEvent(event);
  }
}

export function initializeTelemetryLogger(): void {
  if (!isTelemetryEnabled()) {
    return;
  }

  telemetryLogger = new oteljs.TelemetryLogger();
  telemetryLogger.addSink(new OfficeJsSink());

  telemetryLogger.setTenantTokens({
    Office: {
      ScriptLab: {
        ariaTenantToken:
          '2b76429bb1b7429c8a2e87e51aa8af6b-0dc6a93e-bf04-44c5-9cf5-8b0cd229d414-7620',
        nexusTenantToken: 1783,
      },
    },
  });
}

export function sendTelemetryEvent(
  name: string,
  additionalDataFields: oteljs.DataField[],
) {
  if (!isTelemetryEnabled()) {
    return;
  }

  // For debugging only: console.info(`[Telemetry] Sending event ${name}...`);
  telemetryLogger.sendTelemetryEvent({
    eventName: 'Office.ScriptLab.' + name,
    eventFlags: {
      dataCategories: oteljs.DataCategories.ProductServiceUsage,
      diagnosticLevel: oteljs.DiagnosticLevel.FullEvent,
    },
    dataFields: [
      ...additionalDataFields,
      oteljs.makeStringDataField('Environment', getCurrentEnv()),
    ],
  });
}

///////////////////////////////////////

function isTelemetryEnabled(): boolean {
  // For now, until complete privacy review, only enabling telemetry in local dev environment, not production:
  const TELEMETRY_ENABLED = process.env.NODE_ENV !== 'production';
  return TELEMETRY_ENABLED;
}

// cspell:ignore oteljs
