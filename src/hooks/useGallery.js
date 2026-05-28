import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { getApiClient } from 'utils/apiclient';
import { fileCat } from '../utils/constants';
import { parseMedia, flattenFolders, toRootArr, parseSortableId, itemKey } from '../utils/utils';

const TEMP_ORDER = -9999;

export default function useGallery() {
  const api = getApiClient();

  // ── State ────────────────────────────────────────────────────────────────
  const [folders, setFolders] = useState([]);
  const [mediaMap, setMediaMap] = useState({});
  const [cid, setCid] = useState(0);
  const [query, setQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState('');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState([0]);
  const [hist, setHist] = useState([0]);
  const [hi, setHi] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadTask, setUploadTask] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  const [dlg, setDlg] = useState(null);
  const [target, setTarget] = useState(null);
  const [folderNames, setFolderNames] = useState({ vi: '', en: '' });
  const [renameVal, setRenameVal] = useState('');
  const [moveDestId, setMoveDestId] = useState('');

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkDlg, setBulkDlg] = useState(null);
  const [bulkMoveDest, setBulkMoveDest] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fr, mr] = await Promise.all([
        api.get('/folders'),
        api.get('/media', { params: { page, limit: 20, folder_id: cid || null, type: mediaFilter || undefined } })
      ]);

      const flat = flattenFolders(toRootArr(fr.data?.data ?? fr.data));

      const parsedFolders = flat.map((f) => ({
        ...f,
        id: Number(f.id),
        isFolder: true,
        name: f.name_vi || f.name_en || f.name || `Folder ${f.id}`,
        parentId: f.parent_id == null ? 0 : Number(f.parent_id),
        order: f.order ?? f.sort_order ?? 0
      }));

      const mm = { [cid]: [], ...(cid ? { 0: [] } : {}) };
      flat.forEach((f) => {
        const fid = Number(f.id);
        if (!mm[fid]) mm[fid] = [];
        (f.medias ?? []).forEach((m) => mm[fid].push(parseMedia(m, fid)));
      });

      const raw = mr.data?.data ?? mr.data ?? [];
      let media = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : Array.isArray(mr.data?.data) ? mr.data.data : [];
      if (!Array.isArray(raw) && (raw.last_page || mr.data?.last_page)) setTotalPages(Number(raw.last_page || mr.data.last_page));

      media.forEach((m) => {
        const fid = m.folder_id == null ? 0 : Number(m.folder_id);
        if (!mm[fid]) mm[fid] = [];
        const p = parseMedia(m, fid);
        if (!mm[fid].find((x) => x.id === p.id)) mm[fid].push(p);
      });

      setFolders(parsedFolders);
      setMediaMap(mm);
    } catch (e) {
      console.error('Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  }, [page, cid, mediaFilter]);

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const go = useCallback(
    (id, skip = false) => {
      if (id === cid) return;
      if (!skip) {
        const next = [...hist.slice(0, hi + 1), id];
        setHist(next);
        setHi(next.length - 1);
      }
      setCid(id);
      setQuery('');
      setPage(1);
      setSelected(new Set());
      const f = folders.find((x) => x.id === id);
      if (f && !expanded.includes(f.parentId)) setExpanded((p) => [...p, f.parentId]);
    },
    [cid, hist, hi, folders, expanded]
  );

  const goBack = () => {
    if (hi > 0) {
      setHi((h) => h - 1);
      setCid(hist[hi - 1]);
      setQuery('');
      setPage(1);
    }
  };
  const goFwd = () => {
    if (hi < hist.length - 1) {
      setHi((h) => h + 1);
      setCid(hist[hi + 1]);
      setQuery('');
      setPage(1);
    }
  };
  const goUp = () => {
    if (!cid) return;
    const f = folders.find((x) => x.id === cid);
    go(f ? f.parentId : 0);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const allItems = useMemo(() => [...folders, ...Object.values(mediaMap).flat()], [folders, mediaMap]);

  const listed = useMemo(() => {
    let src = query
      ? allItems.filter((i) => i.name?.toLowerCase().includes(query.toLowerCase()))
      : cid === 0
        ? [...folders.filter((f) => f.parentId === 0), ...(mediaMap[0] || [])]
        : [...folders.filter((f) => f.parentId === cid), ...(mediaMap[cid] ?? [])];
    if (mediaFilter) src = src.filter((i) => i.isFolder || fileCat(i.type) === mediaFilter);
    return src.sort((a, b) => {
      if (a.isFolder && b.isFolder) return (a.order ?? 0) - (b.order ?? 0);
      return a.isFolder ? -1 : b.isFolder ? 1 : 0;
    });
  }, [folders, mediaMap, allItems, cid, query, mediaFilter]);

  const sidebarRoots = useMemo(() => folders.filter((f) => f.parentId === 0).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [folders]);

  const crumbs = useMemo(() => {
    const path = [];
    let id = cid;
    while (id) {
      const f = folders.find((x) => x.id === id);
      if (f) {
        path.unshift(f);
        id = f.parentId;
      } else break;
    }
    return [{ id: 0, name: 'Home' }, ...path];
  }, [folders, cid]);

  // ── Dialog helpers ───────────────────────────────────────────────────────
  const openDlg = (type, item) => {
    setDlg(type);
    setTarget(item);
    if (type === 'rename') setRenameVal(item?.name || '');
    if (type === 'move') setMoveDestId('');
  };
  const closeDlg = () => {
    setDlg(null);
    setTarget(null);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const doCreate = async () => {
    if (!folderNames.vi || !folderNames.en) return;
    await api.post('/folders', { name_vi: folderNames.vi, name_en: folderNames.en, parent_id: cid || null });
    setFolderNames({ vi: '', en: '' });
    closeDlg();
    fetchData();
  };

  const doRename = async () => {
    if (!renameVal || !target) return;
    target.isFolder
      ? await api.put(`/folders/${target.id}`, { name_vi: renameVal, name_en: renameVal, parent_id: target.parentId || null })
      : await api.put(`/media/${target.id}`, { caption_vi: renameVal, caption_en: renameVal, folder_id: target.parentId || null });
    closeDlg();
    fetchData();
  };

  const doDelete = async () => {
    if (!target) return;
    target.isFolder ? await api.delete(`/folders/${target.id}`) : await api.delete(`/media/${target.id}`);
    closeDlg();
    fetchData();
  };

  const doMove = async () => {
    if (!target || moveDestId === '') return;
    const d = parseInt(moveDestId);
    target.isFolder
      ? await api.put(`/folders/${target.id}`, {
          name_vi: target.name_vi || target.name,
          name_en: target.name_en || target.name,
          parent_id: d || null
        })
      : await api.put(`/media/${target.id}`, {
          caption_vi: target.caption_vi || target.name,
          caption_en: target.caption_en || target.name,
          folder_id: d || null
        });
    closeDlg();
    fetchData();
  };

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadTask({ current: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append('file', files[i]);
      if (cid) form.append('folder_id', cid);
      const base = files[i].name.split('.')[0];
      form.append('caption_vi', base);
      form.append('caption_en', base);
      try {
        await api.post('/media', form);
      } catch (err) {
        console.error(err);
      }
      setUploadTask({ current: i + 1, total: files.length });
    }
    setUploadTask(null);
    e.target.value = '';
    fetchData();
  };

  // ── Selection ────────────────────────────────────────────────────────────
  const toggleSelectMode = () => {
    setSelectMode((p) => !p);
    setSelected(new Set());
  };
  const toggleSelect = (item) =>
    setSelected((prev) => {
      const n = new Set(prev);
      const k = itemKey(item);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  const toggleSelectAll = () => setSelected(selected.size === listed.length ? new Set() : new Set(listed.map(itemKey)));

  const selectedItems = useMemo(() => listed.filter((i) => selected.has(itemKey(i))), [listed, selected]);
  const allSelected = selected.size > 0 && selected.size === listed.length;
  const someSelected = selected.size > 0 && !allSelected;

  // ── Bulk CRUD ────────────────────────────────────────────────────────────
  const doBulkDelete = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(selectedItems.map((i) => (i.isFolder ? api.delete(`/folders/${i.id}`) : api.delete(`/media/${i.id}`))));
      setSelected(new Set());
      setBulkDlg(null);
      setSelectMode(false);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  const doBulkMove = async () => {
    if (!bulkMoveDest && bulkMoveDest !== 0) return;
    setBulkLoading(true);
    const d = parseInt(bulkMoveDest);
    try {
      await Promise.all(
        selectedItems.map((i) =>
          i.isFolder
            ? api.put(`/folders/${i.id}`, { name_vi: i.name_vi || i.name, name_en: i.name_en || i.name, parent_id: d || null })
            : api.put(`/media/${i.id}`, { caption_vi: i.caption_vi || i.name, caption_en: i.caption_en || i.name, folder_id: d || null })
        )
      );
      setSelected(new Set());
      setBulkDlg(null);
      setSelectMode(false);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const persistSwap = useCallback(
    async (folderA, folderB) => {
      const payload = (f) => ({
        name_vi: f.name_vi || f.name,
        name_en: f.name_en || f.name,
        parent_id: f.parentId === 0 ? null : f.parentId
      });
      await api.put(`/folders/${folderA.id}`, { ...payload(folderA), order: TEMP_ORDER });
      await api.put(`/folders/${folderB.id}`, {
        ...payload(folderB),
        parent_id: folderA.parentId === 0 ? null : folderA.parentId,
        order: folderA.order
      });
      await api.put(`/folders/${folderA.id}`, {
        ...payload(folderA),
        parent_id: folderB.parentId === 0 ? null : folderB.parentId,
        order: folderB.order
      });
    },
    [api]
  );

  // Dùng chung: optimistic update + persistSwap + refetch
  const doSwap = useCallback(
    async (pool, activeId, overId) => {
      const ids = pool.map((f) => f.id);
      const oldIdx = ids.indexOf(activeId);
      const newIdx = ids.indexOf(overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(pool, oldIdx, newIdx).map((f, i) => ({ ...f, order: i }));
      setFolders((prev) => [...prev.filter((f) => !reordered.find((r) => r.id === f.id)), ...reordered]);
      try {
        await persistSwap(pool[oldIdx], pool[newIdx]);
      } catch (err) {
        console.error('Swap failed:', err);
      }
      await new Promise((r) => setTimeout(r, 500));
      await fetchDataRef.current();
    },
    [persistSwap]
  );

  // Sidebar DndContext — chỉ reorder root-level folders
  const handleSidebarDragEnd = useCallback(
    async ({ active, over }) => {
      if (!over || active.id === over.id) return;
      await doSwap(sidebarRoots, parseSortableId(active.id), parseSortableId(over.id));
    },
    [sidebarRoots, doSwap]
  );

  // Content DndContext — chỉ reorder folders trong cid hiện tại
  const handleContentDragEnd = useCallback(
    async ({ active, over }) => {
      if (!over || active.id === over.id) return;
      const contentFolders = listed.filter((i) => i.isFolder);
      await doSwap(contentFolders, parseSortableId(active.id), parseSortableId(over.id));
    },
    [listed, doSwap]
  );

  return {
    // state
    folders,
    cid,
    query,
    setQuery,
    mediaFilter,
    setMediaFilter,
    view,
    setView,
    loading,
    expanded,
    setExpanded,
    hist,
    hi,
    page,
    setPage,
    totalPages,
    uploadTask,
    viewItem,
    setViewItem,
    reorderMode,
    setReorderMode,
    dlg,
    target,
    folderNames,
    setFolderNames,
    renameVal,
    setRenameVal,
    moveDestId,
    setMoveDestId,
    selectMode,
    selected,
    bulkDlg,
    setBulkDlg,
    bulkMoveDest,
    setBulkMoveDest,
    bulkLoading,
    // derived
    listed,
    sidebarRoots,
    crumbs,
    selectedItems,
    allSelected,
    someSelected,
    // actions
    go,
    goBack,
    goFwd,
    goUp,
    fetchData,
    openDlg,
    closeDlg,
    doCreate,
    doRename,
    doDelete,
    doMove,
    handleUpload,
    handleSidebarDragEnd,
    handleContentDragEnd,
    toggleSelectMode,
    toggleSelect,
    toggleSelectAll,
    doBulkDelete,
    doBulkMove
  };
}
