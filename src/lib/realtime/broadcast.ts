import { RealtimeChannel, createClient } from "@supabase/supabase-js";

interface RealtimeState {
  currentAttendee: 0;
}

const channels: { [key: string]: RealtimeChannel } = {};

const getChannel = (() => {
  const client = createClient(
    "https://dokkqfbdmbsbnsataxti.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva2txZmJkbWJzYm5zYXRheHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1NjM0OTQsImV4cCI6MjAwNTEzOTQ5NH0.tdv1IIpBYI-iuHH9K64Vno5r-MjR1EXEztCndhbB20c"
  );

  return (projectId: string) => {
    if (channels[projectId]) {
      return channels[projectId];
    }

    const channel = client.channel(projectId);
    channels[projectId] = channel;

    return channel;
  };
})();

const removeChannel = (projectId: string) => {
  if (channels[projectId]) {
    delete channels[projectId];
  }
};

export const subscribe = (
  projectId: string,
  changeHandler: (
    event: "currentAttendeeChanged" | "stateChanged",
    state?: RealtimeState
  ) => void
) => {
  const channel = getChannel(projectId);

  if (channel.state === "joined") {
    return;
  }

  return new Promise<void>((resolve, reject) => {
    channel
      .on("broadcast", { event: "currentAttendeeChanged" }, (event) => {
        changeHandler("currentAttendeeChanged", {
          currentAttendee: event.payload.currentAttendee,
        });
      })
      .on("broadcast", { event: "stateChanged" }, () => {
        changeHandler("stateChanged");
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          resolve();
        } else {
          reject();
        }
      });
  });
};

export const trackCurrentAttendee = async (
  projectId: string,
  currentAttendee: number
) => {
  const channel = getChannel(projectId);

  try {
    await channel.send({
      type: "broadcast",
      event: "currentAttendeeChanged",
      payload: {
        currentAttendee,
      },
    });
  } catch {}
};

export const trackStateChanged = async (projectId: string) => {
  const channel = getChannel(projectId);

  try {
    await channel.send({
      type: "broadcast",
      event: "stateChanged",
    });
  } catch {}
};

export const unsubscribe = async (projectId: string) => {
  const channel = getChannel(projectId);
  await channel.unsubscribe();
  removeChannel(projectId);
};
