import type { Track } from '@/app/types/api';

export type RepeatMode = 'off' | 'all' | 'one';

export interface ShuffleCycle {
  order: string[];
  position: number;
}

interface QueueStep {
  track: Track | null;
  cycle: ShuffleCycle;
}

export const createEmptyShuffleCycle = (): ShuffleCycle => ({ order: [], position: -1 });

export const buildQueue = (
  track: Track,
  requestedQueue: Track[] | undefined,
  currentQueue: Track[],
) => {
  const source = requestedQueue ?? (
    currentQueue.some((queuedTrack) => queuedTrack.id === track.id) ? currentQueue : [track]
  );
  const seen = new Set<string>();
  const normalized = source.filter((queuedTrack) => {
    if (!queuedTrack?.id || seen.has(queuedTrack.id)) return false;
    seen.add(queuedTrack.id);
    return true;
  });

  if (!seen.has(track.id)) normalized.unshift(track);
  return normalized;
};

export const createShuffleCycle = (queue: Track[], currentTrackId: string): ShuffleCycle => {
  const remaining = queue
    .map((track) => track.id)
    .filter((trackId) => trackId !== currentTrackId);

  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [remaining[index], remaining[swapIndex]] = [remaining[swapIndex], remaining[index]];
  }

  return { order: [currentTrackId, ...remaining], position: 0 };
};

const isShuffleCycleValid = (cycle: ShuffleCycle, queue: Track[], currentTrackId: string) => {
  if (cycle.position < 0 || cycle.order[cycle.position] !== currentTrackId) return false;
  if (cycle.order.length !== queue.length) return false;

  const queueIds = new Set(queue.map((track) => track.id));
  return cycle.order.every((trackId) => queueIds.has(trackId));
};

const ensureShuffleCycle = (cycle: ShuffleCycle, queue: Track[], currentTrackId: string) => (
  isShuffleCycleValid(cycle, queue, currentTrackId)
    ? cycle
    : createShuffleCycle(queue, currentTrackId)
);

export const getNextQueueTrack = (
  queue: Track[],
  currentTrackId: string,
  isShuffle: boolean,
  repeatMode: RepeatMode,
  currentCycle: ShuffleCycle,
): QueueStep => {
  if (queue.length === 0) return { track: null, cycle: currentCycle };

  if (!isShuffle) {
    const currentIndex = queue.findIndex((track) => track.id === currentTrackId);
    const track = currentIndex < 0
      ? null
      : queue[currentIndex + 1] ?? (repeatMode === 'all' ? queue[0] : null);
    return { track, cycle: currentCycle };
  }

  const cycle = ensureShuffleCycle(currentCycle, queue, currentTrackId);
  const nextPosition = cycle.position + 1;
  if (nextPosition < cycle.order.length) {
    return {
      track: queue.find((track) => track.id === cycle.order[nextPosition]) ?? null,
      cycle: { ...cycle, position: nextPosition },
    };
  }

  if (repeatMode !== 'all') return { track: null, cycle };

  const nextCycle = createShuffleCycle(queue, currentTrackId);
  if (nextCycle.order.length === 1) return { track: queue[0], cycle: nextCycle };

  return {
    track: queue.find((track) => track.id === nextCycle.order[1]) ?? null,
    cycle: { ...nextCycle, position: 1 },
  };
};

export const getPreviousQueueTrack = (
  queue: Track[],
  currentTrackId: string,
  isShuffle: boolean,
  repeatMode: RepeatMode,
  currentCycle: ShuffleCycle,
): QueueStep => {
  if (queue.length === 0) return { track: null, cycle: currentCycle };

  if (!isShuffle) {
    const currentIndex = queue.findIndex((track) => track.id === currentTrackId);
    const track = currentIndex > 0
      ? queue[currentIndex - 1]
      : currentIndex === 0 && repeatMode === 'all'
        ? queue[queue.length - 1]
        : null;
    return { track, cycle: currentCycle };
  }

  const cycle = ensureShuffleCycle(currentCycle, queue, currentTrackId);
  if (cycle.position <= 0) return { track: null, cycle };

  const previousPosition = cycle.position - 1;
  return {
    track: queue.find((track) => track.id === cycle.order[previousPosition]) ?? null,
    cycle: { ...cycle, position: previousPosition },
  };
};

export const appendTrackToQueue = (
  queue: Track[],
  track: Track,
  isShuffle: boolean,
  currentTrackId: string | undefined,
  currentCycle: ShuffleCycle,
) => {
  if (queue.some((queuedTrack) => queuedTrack.id === track.id)) {
    return { queue, cycle: currentCycle };
  }

  const nextQueue = [...queue, track];
  if (!isShuffle || !currentTrackId) return { queue: nextQueue, cycle: currentCycle };
  if (!isShuffleCycleValid(currentCycle, queue, currentTrackId)) {
    return { queue: nextQueue, cycle: createShuffleCycle(nextQueue, currentTrackId) };
  }

  const nextOrder = [...currentCycle.order];
  const remainingSlots = nextOrder.length - currentCycle.position;
  const insertionIndex = currentCycle.position + 1 + Math.floor(Math.random() * remainingSlots);
  nextOrder.splice(insertionIndex, 0, track.id);
  return { queue: nextQueue, cycle: { ...currentCycle, order: nextOrder } };
};
