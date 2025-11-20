import { useState } from 'react';
import { XMarkIcon, FolderPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { addAssetsToAlbum, getAlbums } from '../lib/albums';

interface BulkActionsProps {
  selectedIds: Set<number>;
  onClearSelection: () => void;
  onAddToAlbum?: (albumId: string, assetIds: number[]) => void;
  onDelete?: () => void;
}

export default function BulkActions({ selectedIds, onClearSelection, onAddToAlbum, onDelete }: BulkActionsProps) {
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const albums = getAlbums();
  const count = selectedIds.size;

  const handleAddToAlbum = (albumId: string) => {
    const assetIds = Array.from(selectedIds);
    if (onAddToAlbum) {
      onAddToAlbum(albumId, assetIds);
    } else {
      addAssetsToAlbum(albumId, assetIds);
    }
    setShowAlbumMenu(false);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('albumUpdated'));
    onClearSelection();
  };

  if (count === 0) return null;

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1rem)]">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-2 sm:p-3 flex flex-wrap items-center gap-1.5 sm:gap-3">
        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
          {count} {count === 1 ? 'item' : 'items'}
        </span>

        <div className="relative">
          <button
            onClick={() => setShowAlbumMenu(!showAlbumMenu)}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            <FolderPlusIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Add to Album</span>
            <span className="sm:hidden">Album</span>
          </button>

          {showAlbumMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden">
              {albums.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {albums.map((album) => (
                    <button
                      key={album.id}
                      onClick={() => handleAddToAlbum(album.id)}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm"
                    >
                      <div className="font-medium">{album.name}</div>
                      {album.description && (
                        <div className="text-xs text-zinc-500 truncate">{album.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-zinc-500 text-center">
                  No albums. Create one first.
                </div>
              )}
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            <TrashIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Delete</span>
            <span className="sm:hidden">Del</span>
          </button>
        )}

        <button
          onClick={onClearSelection}
          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2"
        >
          <XMarkIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          Clear
        </button>
      </div>
    </div>
  );
}

