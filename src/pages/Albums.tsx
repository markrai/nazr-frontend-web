import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  getAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  type Album,
} from '../lib/albums';
import { useAssetsInfinite } from '../lib/hooks';
import GalleryGrid from '../components/GalleryGrid';
import { useAdaptivePageSize } from '../lib/adaptiveLoading';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { pageSize: adaptivePageSize } = useAdaptivePageSize();

  // Load albums on mount
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setIsLoading(true);
        const loadedAlbums = await getAlbums();
        setAlbums(loadedAlbums);
      } catch (error) {
        console.error('Failed to load albums:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAlbums();
  }, []);

  // Fetch all assets to display in albums
  const {
    data: assetsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAssetsInfinite({ sort: 'mtime', order: 'desc', pageSize: adaptivePageSize });
  const allAssets = assetsData?.pages.flatMap((p) => p.items) ?? [];
  const assetMap = useMemo(() => {
    const map = new Map<number, typeof allAssets[0]>();
    allAssets.forEach((asset) => map.set(asset.id, asset));
    return map;
  }, [allAssets]);

  // Load additional pages only if the selected album references unseen assets
  useEffect(() => {
    if (!selectedAlbum || !hasNextPage || isFetchingNextPage) return;
    const loadedIds = new Set(allAssets.map((asset) => asset.id));
    const missing = selectedAlbum.assetIds.filter((id) => !loadedIds.has(id));
    if (missing.length > 0) {
      fetchNextPage();
    }
  }, [selectedAlbum, allAssets, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditName('');
    setEditDescription('');
  };

  const handleEdit = (album: Album) => {
    setSelectedAlbum(album);
    setIsEditing(true);
    setEditName(album.name);
    setEditDescription(album.description || '');
  };

  const handleSave = async () => {
    if (isCreating) {
      if (editName.trim()) {
        try {
          const newAlbum = await createAlbum(editName.trim(), editDescription.trim() || undefined);
          const loadedAlbums = await getAlbums();
          setAlbums(loadedAlbums);
          setSelectedAlbum(newAlbum);
          setIsCreating(false);
        } catch (error) {
          console.error('Failed to create album:', error);
          alert('Failed to create album. Please try again.');
        }
      }
    } else if (isEditing && selectedAlbum) {
      if (editName.trim()) {
        try {
          await updateAlbum(selectedAlbum.id, {
            name: editName.trim(),
            description: editDescription.trim() || undefined,
          });
          const loadedAlbums = await getAlbums();
          setAlbums(loadedAlbums);
          setIsEditing(false);
          const updated = loadedAlbums.find((a) => a.id === selectedAlbum.id);
          setSelectedAlbum(updated || null);
        } catch (error) {
          console.error('Failed to update album:', error);
          alert('Failed to update album. Please try again.');
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this album?')) {
      try {
        await deleteAlbum(id);
        const loadedAlbums = await getAlbums();
        setAlbums(loadedAlbums);
        if (selectedAlbum?.id === id) {
          setSelectedAlbum(null);
        }
      } catch (error) {
        console.error('Failed to delete album:', error);
        alert('Failed to delete album. Please try again.');
      }
    }
  };

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setIsCreating(false);
    setIsEditing(false);
  };

  const albumAssets = selectedAlbum
    ? selectedAlbum.assetIds.map((id) => assetMap.get(id)).filter(Boolean) as typeof allAssets
    : [];

  return (
    <div className="container-responsive py-6 space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Album
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        {/* Albums sidebar */}
        <div className="space-y-2">
          {(isCreating || isEditing) && (
            <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Album name"
                className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {albums.map((album) => (
              <div
                key={album.id}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedAlbum?.id === album.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                onClick={() => handleSelectAlbum(album)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{album.name}</div>
                    {album.description && (
                      <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {album.description}
                      </div>
                    )}
                    <div className="text-xs text-zinc-400 mt-1">
                      {album.assetIds.length} {album.assetIds.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(album)}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-sm text-zinc-500">
              Loading albums...
            </div>
          ) : albums.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-sm text-zinc-500">
              No albums yet. Create one to get started.
            </div>
          ) : null}
        </div>

        {/* Album content */}
        <div>
          {selectedAlbum ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedAlbum.name}</h2>
                {selectedAlbum.description && (
                  <p className="text-sm text-zinc-500 mt-1">{selectedAlbum.description}</p>
                )}
              </div>
              {albumAssets.length > 0 ? (
                <GalleryGrid assets={albumAssets} hasMore={false} />
              ) : (
                <div className="text-center py-12 text-sm text-zinc-500">
                  This album is empty. Add assets from the gallery or search.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-zinc-500">
              Select an album to view its contents, or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

