import Card from './Card.jsx'
import RoomRow from './RoomRow.jsx'
import { MAX_ROOMS } from '../config/appConfig.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function RoomsSection({
  rooms,
  onUpdateRoom,
  onRemoveRoom,
  onAddRoom,
  error,
}) {
  const { t } = useLanguage()
  const atMax = rooms.length >= MAX_ROOMS

  return (
    <Card step={3} title={t('roomsTitle')}>
      <ul className="flex flex-col gap-3">
        {rooms.map((room, index) => (
          <RoomRow
            key={room.id}
            room={room}
            index={index}
            canRemove={rooms.length > 1}
            onChange={(next) => onUpdateRoom(room.id, next)}
            onRemove={() => onRemoveRoom(room.id)}
          />
        ))}
      </ul>

      {error && (
        <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>
      )}

      <button
        type="button"
        onClick={onAddRoom}
        disabled={atMax}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ocean-300 px-4 py-3 font-semibold text-ocean-700 transition hover:border-ocean-400 hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300 sm:w-auto"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-5"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        {t('addRoom')}
      </button>

      {atMax && (
        <p className="mt-2 text-sm text-slate-500">
          {t('maxRoomsReached', { max: MAX_ROOMS })}
        </p>
      )}
    </Card>
  )
}
