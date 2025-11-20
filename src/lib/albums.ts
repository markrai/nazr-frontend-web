import type { Asset } from '../types';

export interface Album {
  id: string;
  name: string;
  description?: string;
  assetIds: number[];
  createdAt: number;
  updatedAt: number;
}

const ALBUMS_KEY = 'nazr.albums';
const COLLECTIONS_KEY_OLD = 'nazr.collections'; // Legacy key for migration

export function getAlbums(): Album[] {
  try {
    // Check for new albums key first
    const stored = localStorage.getItem(ALBUMS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Migrate from old collections key if it exists
    const oldStored = localStorage.getItem(COLLECTIONS_KEY_OLD);
    if (oldStored) {
      try {
        const collections = JSON.parse(oldStored);
        // Convert old collections to albums format (they're compatible)
        saveAlbums(collections);
        // Remove old key after migration
        localStorage.removeItem(COLLECTIONS_KEY_OLD);
        return collections;
      } catch {
        // If migration fails, return empty array
        return [];
      }
    }
    
    return [];
  } catch {
    return [];
  }
}

export function saveAlbums(albums: Album[]): void {
  try {
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
  } catch (e) {
    console.error('Failed to save albums:', e);
  }
}

export function createAlbum(name: string, description?: string): Album {
  const albums = getAlbums();
  const newAlbum: Album = {
    id: `alb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    assetIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  albums.push(newAlbum);
  saveAlbums(albums);
  return newAlbum;
}

export function updateAlbum(id: string, updates: Partial<Pick<Album, 'name' | 'description'>>): Album | null {
  const albums = getAlbums();
  const index = albums.findIndex((a) => a.id === id);
  if (index === -1) return null;

  albums[index] = {
    ...albums[index],
    ...updates,
    updatedAt: Date.now(),
  };
  saveAlbums(albums);
  return albums[index];
}

export function deleteAlbum(id: string): boolean {
  const albums = getAlbums();
  const filtered = albums.filter((a) => a.id !== id);
  if (filtered.length === albums.length) return false;
  saveAlbums(filtered);
  return true;
}

export function addAssetsToAlbum(albumId: string, assetIds: number[]): Album | null {
  const albums = getAlbums();
  const index = albums.findIndex((a) => a.id === albumId);
  if (index === -1) return null;

  const existingIds = new Set(albums[index].assetIds);
  assetIds.forEach((id) => existingIds.add(id));
  albums[index].assetIds = Array.from(existingIds);
  albums[index].updatedAt = Date.now();
  saveAlbums(albums);
  return albums[index];
}

export function removeAssetsFromAlbum(albumId: string, assetIds: number[]): Album | null {
  const albums = getAlbums();
  const index = albums.findIndex((a) => a.id === albumId);
  if (index === -1) return null;

  const idSet = new Set(assetIds);
  albums[index].assetIds = albums[index].assetIds.filter((id) => !idSet.has(id));
  albums[index].updatedAt = Date.now();
  saveAlbums(albums);
  return albums[index];
}

export function getAlbum(id: string): Album | null {
  const albums = getAlbums();
  return albums.find((a) => a.id === id) || null;
}

export function getAlbumsForAsset(assetId: number): Album[] {
  const albums = getAlbums();
  return albums.filter((a) => a.assetIds.includes(assetId));
}

