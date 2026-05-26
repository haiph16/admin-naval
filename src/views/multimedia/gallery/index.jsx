import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme, styled, alpha } from '@mui/material/styles';
import {
  Box, Button, Typography, TextField, IconButton, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  Paper, CircularProgress, Stack, Divider, Collapse, useMediaQuery,
  Chip, MenuItem, Select, FormControl, InputLabel, Pagination,
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { getApiClient } from 'utils/apiclient';
import {
  IconFolder, IconFile, IconSearch, IconUpload, IconLayoutGrid, IconListDetails,
  IconChevronRight, IconChevronDown, IconTrash, IconEdit, IconFileText, IconPhoto,
  IconVideo, IconFileMusic, IconArrowLeft, IconArrowRight, IconArrowUp, IconHome,
  IconRefresh, IconFolderPlus, IconCheck, IconAlertTriangle, IconFolderShare,
} from '@tabler/icons-react';

// ─── Constants ────────────────────────────────────────────────────────────────

import { FILE_META, fileCat } from './constants';
import {
  Shell, Topbar, NBtn, AddrBar, SBar, SubBar, SBtn, AccentBtn, VToggle, VBtn,
  SidebarContainer as Sidebar, SbLabel, SbItem, ItemWrap, ActionBar, ABtn, IconBg, StatusBar
} from './styles';
import GalleryDialogs from './GalleryDialogs';
import MediaViewer from './MediaViewer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FileIcon({ mime, isFolder, size = 26 }) {
  const theme = useTheme();
  if (isFolder) return <IconFolder size={size} color="#FFCA28" />;
  const { color } = FILE_META[fileCat(mime)];
  const cat = fileCat(mime);
  if (cat === 'image') return <IconPhoto size={size} color={color} />;
  if (cat === 'video') return <IconVideo size={size} color={color} />;
  if (cat === 'audio') return <IconFileMusic size={size} color={color} />;
  if (cat === 'pdf' || cat === 'text') return <IconFileText size={size} color={color} />;
  return <IconFile size={size} color={theme.palette.text.disabled} />;
}



// ─── Sidebar Tree ─────────────────────────────────────────────────────────────

function TreeItem({ folder, level, cid, folders, onNav, expanded, setExpanded }) {
  const theme = useTheme();
  const isOpen = expanded.includes(folder.id);
  const hasKids = folders.some(f => f.parentId === folder.id);
  const isActive = cid === folder.id;
  return (
    <Box>
      <SbItem isactive={String(isActive)} style={{ paddingLeft: 8 + level * 14 }} onClick={() => onNav(folder.id)}>
        <Box component="span" onClick={e => { if (hasKids) { e.stopPropagation(); setExpanded(p => isOpen ? p.filter(i => i !== folder.id) : [...p, folder.id]); } }} sx={{ display: 'flex', alignItems: 'center' }}>
          {hasKids ? (isOpen ? <IconChevronDown size={11} /> : <IconChevronRight size={11} />) : <Box sx={{ width: 11 }} />}
        </Box>
        <IconFolder size={14} color={isActive ? theme.palette.primary.main : '#FFCA28'} />
        <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{folder.name}</Typography>
      </SbItem>
      {hasKids && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          {folders.filter(f => f.parentId === folder.id).map(c => (
            <TreeItem key={c.id} folder={c} level={level + 1} cid={cid} folders={folders} onNav={onNav} expanded={expanded} setExpanded={setExpanded} />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Gallery() {
  const theme = useTheme();
  const api = getApiClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // folders: flat list of folder objects (with parentId)
  // mediaMap: { [folderId]: [...media items] }
  const [folders, setFolders] = useState([]);
  const [mediaMap, setMediaMap] = useState({});

  const [cid, setCid] = useState(0);        // current folder id (0 = home)
  const [query, setQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState('');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState([0]);
  const [hist, setHist] = useState([0]);
  const [hi, setHi] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  // dialogs
  const [dlg, setDlg] = useState(null);     // 'new' | 'rename' | 'delete' | 'move'
  const [target, setTarget] = useState(null);
  const [folderNames, setFolderNames] = useState({ vi: '', en: '' });
  const [renameVal, setRenameVal] = useState('');
  const [moveDestId, setMoveDestId] = useState('');
  const [viewItem, setViewItem] = useState(null); // Used to display single media file preview

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fr, mr] = await Promise.all([
        api.get('/folders'),
        api.get('/media', { params: { page, limit, folder_id: cid === 0 ? null : cid, type: mediaFilter || undefined } })
      ]);

      let rawFolders = fr.data?.data ?? fr.data ?? [];
      let listRoot = [];
      if (Array.isArray(rawFolders)) {
        listRoot = rawFolders;
      } else if (rawFolders && typeof rawFolders === 'object' && Array.isArray(rawFolders.data)) {
        listRoot = rawFolders.data;
      } else if (fr.data && typeof fr.data === 'object' && Array.isArray(fr.data.data)) {
        listRoot = fr.data.data;
      }

      // Flatten folders if backend returns nested structure
      const list = [];
      const flatten = (arr, parentId = null) => {
        arr.forEach(f => {
          if (parentId !== null && f.parent_id == null) {
            f.parent_id = parentId;
          }
          list.push(f);
          if (Array.isArray(f.children)) flatten(f.children, f.id);
          if (Array.isArray(f.sub_folders)) flatten(f.sub_folders, f.id);
        });
      };
      flatten(listRoot);

      const parsedFolders = list.map(f => ({
        ...f,
        id: Number(f.id),
        isFolder: true,
        name: f.name_vi || f.name_en || f.name || `Folder ${f.id}`,
        parentId: f.parent_id == null ? 0 : Number(f.parent_id),
      }));

      // Build mediaMap: { folderId -> [media, ...] }
      const newMediaMap = { [cid]: [] };
      if (cid !== 0) newMediaMap[0] = [];

      // 1. Process media returned inside folders (if any)
      list.forEach(f => {
        const fid = Number(f.id);
        const medias = Array.isArray(f.medias) ? f.medias : [];
        if (!newMediaMap[fid]) newMediaMap[fid] = [];
        const parsed = medias.map(m => ({
          ...m,
          id: Number(m.id),
          isFolder: false,
          name: m.caption_vi || m.caption_en || m.file_name || `Media ${m.id}`,
          parentId: fid,
          size: m.file_size ? `${Math.round(m.file_size / 1024)} KB` : '—',
          type: m.mime_type,
          url: m.urls?.thumbnail || m.urls?.medium || m.urls?.original || null,
        }));
        newMediaMap[fid] = [...newMediaMap[fid], ...parsed];
      });

      // 2. Process paginated media response
      let rawMedia = mr.data?.data ?? mr.data ?? [];
      let standaloneMedia = [];

      if (Array.isArray(rawMedia)) {
        standaloneMedia = rawMedia;
      } else if (rawMedia && typeof rawMedia === 'object' && Array.isArray(rawMedia.data)) {
        standaloneMedia = rawMedia.data;
        if (rawMedia.last_page) setTotalPages(Number(rawMedia.last_page));
      } else if (mr.data && typeof mr.data === 'object' && Array.isArray(mr.data.data)) {
        standaloneMedia = mr.data.data;
        if (mr.data.last_page) setTotalPages(Number(mr.data.last_page));
      }

      standaloneMedia.forEach(m => {
        const fid = m.folder_id == null ? 0 : Number(m.folder_id);
        const parsedM = {
          ...m,
          id: Number(m.id),
          isFolder: false,
          name: m.caption_vi || m.caption_en || m.file_name || `Media ${m.id}`,
          parentId: fid,
          size: m.file_size ? `${Math.round(m.file_size / 1024)} KB` : '—',
          type: m.mime_type,
          url: m.urls?.thumbnail || m.urls?.medium || m.urls?.original || null,
        };
        if (!newMediaMap[fid]) newMediaMap[fid] = [];
        // Prevent duplicates based on ID
        if (!newMediaMap[fid].find(x => x.id === parsedM.id)) {
          newMediaMap[fid].push(parsedM);
        }
      });

      setFolders(parsedFolders);
      setMediaMap(newMediaMap);
    } catch (e) {
      console.error('Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, cid, mediaFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── navigation ───────────────────────────────────────────────────────────
  const go = useCallback((id, skip = false) => {
    if (id === cid) return;
    if (!skip) {
      const next = hist.slice(0, hi + 1);
      next.push(id);
      setHist(next);
      setHi(next.length - 1);
    }
    setCid(id);
    setQuery('');
    setPage(1);
    const f = folders.find(x => x.id === id);
    if (f && !expanded.includes(f.parentId)) setExpanded(p => [...p, f.parentId]);
  }, [cid, hist, hi, folders, expanded]);

  const goBack = () => { if (hi > 0) { setHi(h => h - 1); setCid(hist[hi - 1]); setQuery(''); setPage(1); } };
  const goFwd = () => { if (hi < hist.length - 1) { setHi(h => h + 1); setCid(hist[hi + 1]); setQuery(''); setPage(1); } };
  const goUp = () => { if (!cid) return; const f = folders.find(x => x.id === cid); go(f ? f.parentId : 0); };

  // ── derived ──────────────────────────────────────────────────────────────
  // allItems = folders + media files trong folder hiện tại (hoặc tất cả khi search)
  const allItems = useMemo(() => {
    const allMedia = Object.values(mediaMap).flat();
    return [...folders, ...allMedia];
  }, [folders, mediaMap]);

  const listed = useMemo(() => {
    let src;
    if (query) {
      src = allItems.filter(i => i.name?.toLowerCase().includes(query.toLowerCase()));
    } else if (cid === 0) {
      // Home: hiện folder gốc (parentId === 0) và media ở home
      src = [...folders.filter(f => f.parentId === 0), ...(mediaMap[0] || [])];
    } else {
      // Trong folder: hiện sub-folder + media của folder đó
      const subFolders = folders.filter(f => f.parentId === cid);
      const mediaInFolder = mediaMap[cid] ?? [];
      src = [...subFolders, ...mediaInFolder];
    }

    if (mediaFilter) {
      src = src.filter(i => i.isFolder || fileCat(i.type) === mediaFilter);
    }

    return src.sort((a, b) => (b.isFolder ? 1 : 0) - (a.isFolder ? 1 : 0));
  }, [folders, mediaMap, allItems, cid, query, mediaFilter]);

  const crumbs = useMemo(() => {
    const path = []; let id = cid;
    while (id !== 0) {
      const f = folders.find(x => x.id === id);
      if (f) { path.unshift(f); id = f.parentId; } else break;
    }
    return [{ id: 0, name: 'Home' }, ...path];
  }, [folders, cid]);

  // ── dialog helpers ───────────────────────────────────────────────────────
  const openDlg = (type, item) => { setDlg(type); setTarget(item); if (type === 'rename') setRenameVal(item?.name || ''); if (type === 'move') setMoveDestId(''); };
  const closeDlg = () => { setDlg(null); setTarget(null); };

  // ── CRUD actions ─────────────────────────────────────────────────────────
  const doCreate = async () => {
    if (!folderNames.vi || !folderNames.en) return;
    try {
      await api.post('/folders', { name_vi: folderNames.vi, name_en: folderNames.en, parent_id: cid === 0 ? null : cid });
      fetchData();
      setFolderNames({ vi: '', en: '' });
      closeDlg();
    } catch (e) { console.error(e); }
  };

  const doRename = async () => {
    if (!renameVal || !target) return;
    try {
      if (target.isFolder) {
        await api.put(`/folders/${target.id}`, {
          name_vi: renameVal,
          name_en: renameVal,
          parent_id: target.parentId === 0 ? null : target.parentId
        });
      } else {
        await api.put(`/media/${target.id}`, {
          caption_vi: renameVal,
          caption_en: renameVal,
          folder_id: target.parentId === 0 ? null : target.parentId
        });
      }
      fetchData();
      closeDlg();
    } catch (e) { console.error(e); }
  };

  const doDelete = async () => {
    if (!target) return;
    try {
      target.isFolder
        ? await api.delete(`/folders/${target.id}`)
        : await api.delete(`/media/${target.id}`);
      fetchData();
      closeDlg();
    } catch (e) { console.error(e); }
  };

  const doMove = async () => {
    if (!target || moveDestId === '') return;
    try {
      const destId = parseInt(moveDestId);
      if (target.isFolder) {
        await api.put(`/folders/${target.id}`, {
          name_vi: target.name_vi || target.name,
          name_en: target.name_en || target.name,
          parent_id: destId === 0 ? null : destId
        });
      } else {
        await api.put(`/media/${target.id}`, {
          caption_vi: target.caption_vi || target.name,
          caption_en: target.caption_en || target.name,
          folder_id: destId === 0 ? null : destId
        });
      }
      fetchData();
      closeDlg();
    } catch (e) { console.error(e); }
  };

  const [uploadTask, setUploadTask] = useState(null); // { current, total }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadTask({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const form = new FormData();
        form.append('file', file);
        if (cid !== 0) form.append('folder_id', cid);
        form.append('caption_vi', file.name.split('.')[0]);
        form.append('caption_en', file.name.split('.')[0]);
        try {
            await api.post('/media', form);
        } catch (err) { console.error(err); }
        setUploadTask({ current: i + 1, total: files.length });
    }
    
    fetchData();
    setUploadTask(null);
    e.target.value = '';
  };

  const getIconBg = item => item.isFolder ? '#FAEEDA' : FILE_META[fileCat(item.type)].bg;

  // ── Item thumbnail (ảnh preview nếu có url) ───────────────────────────────
  function ItemThumb({ item }) {
    if (!item.isFolder && item.url) {
      return (
        <Box sx={{ width: 52, height: 52, borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
          <Box component="img" src={item.url} alt={item.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </Box>
      );
    }
    return <IconBg bg={getIconBg(item)}><FileIcon mime={item.type} isFolder={item.isFolder} size={26} /></IconBg>;
  }

  // ── Inline action buttons ─────────────────────────────────────────────────
  const ItemActions = ({ item }) => (
    <ActionBar className="item-actions" onClick={e => e.stopPropagation()}>
      <ABtn size="small" title="Rename" onClick={() => openDlg('rename', item)}><IconEdit size={13} /></ABtn>
      <ABtn size="small" title="Move" onClick={() => openDlg('move', item)}><IconFolderShare size={13} /></ABtn>
      <ABtn size="small" danger="true" title="Delete" onClick={() => openDlg('delete', item)}><IconTrash size={13} /></ABtn>
    </ActionBar>
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <MainCard content={false}>
      <Shell>

        {/* Topbar */}
        <Topbar>
          <Stack direction="row" spacing={0.25}>
            <NBtn size="small" onClick={goBack} disabled={hi === 0}><IconArrowLeft size={16} /></NBtn>
            <NBtn size="small" onClick={goFwd} disabled={hi >= hist.length - 1}><IconArrowRight size={16} /></NBtn>
            <NBtn size="small" onClick={goUp} disabled={!cid}><IconArrowUp size={16} /></NBtn>
          </Stack>

          <AddrBar>
            <Breadcrumbs separator={<IconChevronRight size={12} />} sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
              {crumbs.map((c, i) => (
                <Link key={c.id} underline="none" onClick={() => go(c.id)} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, cursor: 'pointer',
                  fontWeight: i === crumbs.length - 1 ? 600 : 400,
                  color: i === crumbs.length - 1 ? 'text.primary' : 'text.secondary',
                  px: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' },
                }}>
                  {c.id === 0 && <IconHome size={13} />}{c.id === 0 ? 'Home' : c.name}
                </Link>
              ))}
            </Breadcrumbs>
          </AddrBar>

          <SBar size="small" placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={14} color={theme.palette.text.disabled} /></InputAdornment> }} />
          <NBtn size="small" onClick={fetchData}><IconRefresh size={16} /></NBtn>
        </Topbar>

        {/* Sub-toolbar */}
        <SubBar>
          <AccentBtn onClick={() => openDlg('new', null)} startIcon={<IconFolderPlus size={14} />}>New folder</AccentBtn>

          {/* Upload */}
          {!uploadTask ? (
            <SBtn
              component="label"
              startIcon={<IconUpload size={14} />}
              title="Upload to current folder"
            >
              Upload
              <input type="file" hidden multiple onChange={handleUpload} />
            </SBtn>
          ) : (
            <Chip size="small" color="primary" label={`Uploading ${uploadTask.current}/${uploadTask.total}`} sx={{ height: 28, borderRadius: 2 }} />
          )}

          <FormControl size="small" sx={{ minWidth: 100, ml: 'auto' }}>
            <Select
              value={mediaFilter}
              displayEmpty
              onChange={e => { setMediaFilter(e.target.value); setPage(1); }}
              sx={{ height: 28, fontSize: 12, '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' }, '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider } }}
            >
              <MenuItem value="">All Data</MenuItem>
              <MenuItem value="image">Images</MenuItem>
              <MenuItem value="video">Videos</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <VToggle sx={{ ml: 1 }}>
            <VBtn size="small" isactive={String(view === 'grid')} onClick={() => setView('grid')} aria-label="Grid"><IconLayoutGrid size={15} /></VBtn>
            <VBtn size="small" isactive={String(view === 'list')} onClick={() => setView('list')} aria-label="List"><IconListDetails size={15} /></VBtn>
          </VToggle>
        </SubBar>

        {/* Body */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {!isMobile && (
            <Sidebar>
              <SbLabel>Navigation</SbLabel>
              <SbItem isactive={String(cid === 0)} onClick={() => go(0)}>
                <IconHome size={14} />
                <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>Home</Typography>
              </SbItem>
              <SbLabel sx={{ mt: 0.5 }}>Folders</SbLabel>
              {folders.filter(f => f.parentId === 0).map(f => (
                <TreeItem key={f.id} folder={f} level={0} cid={cid} folders={folders} onNav={go} expanded={expanded} setExpanded={setExpanded} />
              ))}
            </Sidebar>
          )}

          {/* Content area */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, background: theme.palette.background.paper }}>
            {loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={1}>
                <CircularProgress size={26} />
                <Typography variant="caption" color="text.secondary">Loading…</Typography>
              </Box>
            ) : !listed.length ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={1.5} sx={{ color: 'text.disabled' }}>
                <IconFolder size={52} strokeWidth={1} />
                <Typography variant="body2">{query ? `No results for "${query}"` : 'This folder is empty'}</Typography>
                {!query && <AccentBtn onClick={() => openDlg('new', null)} startIcon={<IconFolderPlus size={14} />}>New folder</AccentBtn>}
              </Box>
            ) : view === 'grid' ? (
              /* ── Grid ── */
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '6px' }}>
                {listed.map(item => {
                  const cat = fileCat(item.type);
                  return (
                    <ItemWrap key={`${item.isFolder ? 'f' : 'm'}-${item.id}`} isactive="false"
                      onClick={() => item.isFolder ? go(item.id) : setViewItem(item)}>
                      <ItemActions item={item} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', p: '12px 8px 10px' }}>
                        <ItemThumb item={item} />
                        <Typography sx={{ fontSize: 11, lineHeight: 1.35, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', width: '100%', px: 0.5 }}>
                          {item.name}
                        </Typography>
                        {!item.isFolder && (
                          <Chip label={FILE_META[cat].label} color={FILE_META[cat].chip} size="small"
                            sx={{ height: 15, fontSize: 9, '& .MuiChip-label': { px: 0.75 } }} />
                        )}
                      </Box>
                    </ItemWrap>
                  );
                })}
              </Box>
            ) : (
              /* ── List ── */
              <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 80px', py: 0.75, px: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, mb: 0.5 }}>
                  {['Name', 'Type', 'Size', 'Modified'].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: h !== 'Name' ? 'right' : 'left' }}>{h}</Typography>
                  ))}
                </Box>
                {listed.map(item => {
                  const cat = fileCat(item.type);
                  return (
                    <ItemWrap key={`${item.isFolder ? 'f' : 'm'}-${item.id}`} isactive="false"
                      onClick={() => item.isFolder ? go(item.id) : setViewItem(item)}
                      sx={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 80px', alignItems: 'center', px: 1.5, py: 0.75, mb: 0.25, borderRadius: 1.5 }}>
                      <ItemActions item={item} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                        <FileIcon mime={item.type} isFolder={item.isFolder} size={17} />
                        <Typography variant="body2" noWrap>{item.name}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {!item.isFolder && <Chip label={FILE_META[cat].label} color={FILE_META[cat].chip} size="small" sx={{ height: 15, fontSize: 9, '& .MuiChip-label': { px: 0.75 } }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>{item.isFolder ? '—' : item.size}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}</Typography>
                    </ItemWrap>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        <StatusBar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="inherit">{listed.length} items</Typography>
            <Typography variant="inherit" sx={{ opacity: 0.45 }}>
              {cid === 0 ? 'Click a folder to open it' : 'Hover an item to rename, move or delete'}
            </Typography>
          </Box>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              size="small"
              color="primary"
              shape="rounded"
            />
          )}
        </StatusBar>
      </Shell>

      <GalleryDialogs 
         dlg={dlg} closeDlg={closeDlg} target={target}
         folderNames={folderNames} setFolderNames={setFolderNames} doCreate={doCreate}
         renameVal={renameVal} setRenameVal={setRenameVal} doRename={doRename}
         doDelete={doDelete}
         moveDestId={moveDestId} setMoveDestId={setMoveDestId} doMove={doMove} folders={folders}
      />
      <MediaViewer item={viewItem} onClose={() => setViewItem(null)} />
    </MainCard>
  );
}