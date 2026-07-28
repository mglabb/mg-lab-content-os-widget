"use client";

type Props = {
  handle: string;
  bio: string;
  avatarUrl: string;
  onRefresh: () => void;
  refreshing: boolean;
  planGridActive: boolean;
  onTogglePlanGrid: () => void;
};

export default function ProfileHeader({
  handle,
  bio,
  avatarUrl,
  onRefresh,
  refreshing,
  planGridActive,
  onTogglePlanGrid,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-line">
          {avatarUrl && <img src={avatarUrl} alt={handle} className="h-full w-full object-cover" />}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{handle}</p>
          <p className="text-xs leading-tight text-ink/50">{bio}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:border-ink/30 disabled:opacity-50"
        >
          <span className={refreshing ? "animate-spin" : ""}>↻</span> Refresh
        </button>
        <button
          onClick={onTogglePlanGrid}
          className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${
            planGridActive
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-ink/70 hover:border-ink/30"
          }`}
        >
          ▦ Plan grid
        </button>
      </div>
    </div>
  );
}
