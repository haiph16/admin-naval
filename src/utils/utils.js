export function parseMedia(m, fid) {
  return {
    ...m,
    id: Number(m.id),
    isFolder: false,
    name: m.caption_vi || m.caption_en || m.file_name || `Media ${m.id}`,
    parentId: fid,
    size: m.file_size ? `${Math.round(m.file_size / 1024)} KB` : '—',
    type: m.mime_type,
    url: m.urls?.thumbnail || m.urls?.medium || m.urls?.original || null
  };
}

export function flattenFolders(arr, parentId = null) {
  const list = [];
  arr.forEach((f) => {
    if (parentId !== null && f.parent_id == null) f.parent_id = parentId;
    list.push(f);
    if (f.children?.length) list.push(...flattenFolders(f.children, f.id));
    if (f.sub_folders?.length) list.push(...flattenFolders(f.sub_folders, f.id));
  });
  return list;
}

export function toRootArr(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// "f-123" → 123
export function parseSortableId(id) {
  if (typeof id === 'string' && id.startsWith('f-')) return parseInt(id.slice(2), 10);
  return typeof id === 'number' ? id : parseInt(id, 10);
}

export const itemKey = (i) => `${i.isFolder ? 'f' : 'm'}-${i.id}`;
