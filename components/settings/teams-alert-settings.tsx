"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  toAlertStatusLabel,
  toCurrency,
  toLocalDateTime,
  toSignedCurrency
} from "@/lib/api/serializers";
import type {
  TeamsAlertHistoryResponse,
  TeamsAlertSettingsResponse
} from "@/lib/teams/schemas";
import { LoadingLabel } from "@/components/ui/loading-label";

const initialState: TeamsAlertSettingsResponse = {
  enabled: false,
  destinationLabel: null,
  triggerAmountUsd: 1000,
  hasWebhookUrl: false,
  webhookUrl: null,
  baselineValue: null,
  lastEvaluatedAt: null,
  lastDeliveredAt: null,
  lastFailureAt: null,
  lastFailureMessage: null,
  deliveryStatus: "idle"
};

export function TeamsAlertSettings() {
  const [settings, setSettings] = useState<TeamsAlertSettingsResponse>(initialState);
  const [destinationLabel, setDestinationLabel] = useState("");
  const [triggerAmountUsd, setTriggerAmountUsd] = useState("1000");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<TeamsAlertHistoryResponse>({
    items: [],
    page: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  async function loadHistory(page = 1) {
    setIsHistoryLoading(true);

    const response = await fetch(`/api/settings/teams-alert/history?page=${page}&pageSize=5`, {
      cache: "no-store"
    });
    const payload = (await response.json()) as TeamsAlertHistoryResponse | { error?: string };

    if (!response.ok) {
      toast.error((payload as { error?: string }).error ?? "Unable to load Teams alert history.");
      setIsHistoryLoading(false);
      return;
    }

    setHistory(payload as TeamsAlertHistoryResponse);
    setIsHistoryLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const response = await fetch("/api/settings/teams-alert", {
        cache: "no-store"
      });
      const payload = (await response.json()) as TeamsAlertSettingsResponse | { error?: string };

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        toast.error("Unable to load Teams alert settings.");
        setIsLoading(false);
        return;
      }

      const nextSettings = payload as TeamsAlertSettingsResponse;
      setSettings(nextSettings);
      setDestinationLabel(nextSettings.destinationLabel ?? "");
      setTriggerAmountUsd(String(nextSettings.triggerAmountUsd));
      setWebhookUrl(nextSettings.webhookUrl ?? "");
      setEnabled(nextSettings.enabled);
      setIsLoading(false);

      await loadHistory();
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/settings/teams-alert", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        enabled,
        destinationLabel,
        triggerAmountUsd: Number(triggerAmountUsd),
        webhookUrl: webhookUrl.trim().length > 0 ? webhookUrl : null
      })
    });
    const payload = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      toast.error((payload as { error?: string }).error ?? "Unable to save Teams alerts.");
      return;
    }

    const nextSettings = payload as TeamsAlertSettingsResponse;
    setSettings(nextSettings);
    setDestinationLabel(nextSettings.destinationLabel ?? "");
    setTriggerAmountUsd(String(nextSettings.triggerAmountUsd));
    setEnabled(nextSettings.enabled);
    setWebhookUrl(nextSettings.webhookUrl ?? "");
    await loadHistory(history.page);
    toast.success(nextSettings.enabled ? "Teams alerts saved." : "Teams alerts disabled.");
  }

  const canSubmit =
    !isSaving &&
    destinationLabel.trim().length > 0 &&
    Number.isInteger(Number(triggerAmountUsd)) &&
    Number(triggerAmountUsd) > 0 &&
    (settings.hasWebhookUrl || webhookUrl.trim().length > 0);

  return (
    <form className="teams-alert-card stack" onSubmit={handleSubmit}>
      <div className="teams-alert-copy stack">
        <p className="eyebrow">Microsoft Teams</p>
        <h3>Portfolio Gain Alerts</h3>
        <p className="muted">
          Send a Teams workflow message when your portfolio gains more than the configured
          dollar amount above the last successful alert baseline.
        </p>
      </div>

      <label className="field">
        Destination Label
        <input
          name="destinationLabel"
          value={destinationLabel}
          placeholder="Trading alerts channel"
          onChange={(event) => setDestinationLabel(event.target.value)}
        />
      </label>

      <label className="field">
        Alert Trigger Amount (USD)
        <input
          name="triggerAmountUsd"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={triggerAmountUsd}
          placeholder="1000"
          onChange={(event) => setTriggerAmountUsd(event.target.value)}
        />
      </label>

      <label className="field">
        Teams Workflow Webhook URL
        <input
          name="webhookUrl"
          type="url"
          value={webhookUrl}
          placeholder="https://prod-00.westus.logic.azure.com/..."
          onChange={(event) => setWebhookUrl(event.target.value)}
        />
      </label>

      <label
        className={enabled ? "theme-toggle-switch teams-alert-toggle active" : "theme-toggle-switch teams-alert-toggle"}
      >
        <input
          type="checkbox"
          checked={enabled}
          aria-label="Teams alerts toggle"
          disabled={isLoading || isSaving}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        <div className="teams-alert-toggle-row">
          <span className="theme-toggle-switch-track" aria-hidden="true">
            <span className="theme-toggle-switch-track-label">Off</span>
            <span className="theme-toggle-switch-thumb teams-alert-toggle-thumb">
              <span className="teams-alert-pokeball">
                <span className="teams-alert-pokeball-top" />
                <span className="teams-alert-pokeball-center" />
                <span className="teams-alert-pokeball-bottom" />
              </span>
            </span>
            <span className="theme-toggle-switch-track-label">On</span>
          </span>
          <span className="teams-alert-baseline">
            <span className="muted">Current Baseline</span>
            <strong>
              {settings.baselineValue != null ? toCurrency(settings.baselineValue) : "Not set"}
            </strong>
          </span>
        </div>
        <span className="theme-toggle-switch-copy">
          <span className="theme-toggle-switch-label">Teams Alerts</span>
          <span className="theme-toggle-switch-state">
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </span>
      </label>

      <div className="button-row">
        <button className="button" type="submit" disabled={!canSubmit || isLoading}>
          <LoadingLabel
            isLoading={isSaving}
            label="Save Teams Alerts"
            loadingLabel="Saving Teams alerts"
          />
        </button>
      </div>

      <p className="muted teams-alert-footnote">
        {settings.hasWebhookUrl
          ? "The saved Teams webhook is loaded here. Updating it will replace the existing destination."
          : "Paste the Teams workflow webhook URL you created in Microsoft Teams. Alerts fire only when gains exceed the trigger amount."}
      </p>

      <div className="teams-alert-history stack">
        <div className="section-heading">
          <div>
            <h3>Webhook History</h3>
            <p className="muted">Recent Teams Delivery Attempts Shown In Your Local Time.</p>
          </div>
        </div>

        {isHistoryLoading ? <p className="muted">Loading Webhook History...</p> : null}

        {!isHistoryLoading && history.items.length === 0 ? (
          <p className="muted">No Teams webhook calls have been recorded yet.</p>
        ) : null}

        {!isHistoryLoading && history.items.length > 0 ? (
          <>
            <div className="teams-alert-history-table-wrap">
              <table className="teams-alert-history-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date/Time</th>
                    <th>Gain</th>
                    <th>Portfolio</th>
                    <th>Baseline</th>
                    <th>Response</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((item) => (
                    <tr key={item.id}>
                      <td>{toAlertStatusLabel(item.status)}</td>
                      <td>{toLocalDateTime(item.capturedAt)}</td>
                      <td>{toSignedCurrency(item.gainAmount)}</td>
                      <td>{toCurrency(item.portfolioValue)}</td>
                      <td>{toCurrency(item.baselineValue)}</td>
                      <td>{item.responseCode != null ? `HTTP ${item.responseCode}` : "None"}</td>
                      <td>
                        {item.failureMessage ? (
                          <span className="teams-alert-history-error">{item.failureMessage}</span>
                        ) : (
                          <span className="muted">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="button-row teams-alert-history-pagination">
              <button
                className="button secondary"
                type="button"
                disabled={history.page <= 1 || isHistoryLoading}
                onClick={() => void loadHistory(history.page - 1)}
              >
                Previous
              </button>
              <span className="muted">
                Page {history.page} of {history.totalPages}
              </span>
              <button
                className="button secondary"
                type="button"
                disabled={history.page >= history.totalPages || isHistoryLoading}
                onClick={() => void loadHistory(history.page + 1)}
              >
                Next
              </button>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}
