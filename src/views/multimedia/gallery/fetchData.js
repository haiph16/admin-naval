  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fr, mr] = await Promise.all([api.get('/folders'), api.get('/media')]);
      
      const rawFolders = fr.data?.data ?? fr.data ?? [];
      const rawMedia = mr.data?.data ?? mr.data ?? [];
      
      const list = Array.isArray(rawFolders) ? rawFolders : [];
      const standaloneMedia = Array.isArray(rawMedia) ? rawMedia : [];

      const parsedFolders = list.map(f => ({
        ...f,
        id: Number(f.id),
        isFolder: true,
        name: f.name_vi || f.name_en || f.name || `Folder ${f.id}`,
        parentId: f.parent_id == null ? 0 : Number(f.parent_id),
      }));

      // Initialize mediaMap with an empty array for root (0)
      const newMediaMap = { 0: [] };
      
      // 1. Process media from the standalone /media response
      standaloneMedia.forEach(m => {
        const fid = m.folder_id == null ? 0 : Number(m.folder_id);
        const parsedMedia = {
          ...m,
          id: Number(m.id),
          isFolder: false,
          name: m.caption_vi || m.caption_en || m.file_name || m.name || `Media ${m.id}`,
          parentId: fid,
          size: m.file_size ? `${Math.round(m.file_size / 1024)} KB` : (m.size || '—'),
          type: m.mime_type,
          url: m.urls?.thumbnail || m.urls?.medium || m.urls?.original || m.url || null,
        };
        if (!newMediaMap[fid]) newMediaMap[fid] = [];
        newMediaMap[fid].push(parsedMedia);
      });

      // 2. Process nested media from the /folders response (if any)
      list.forEach(f => {
        const fid = Number(f.id);
        const nestedMedias = Array.isArray(f.medias) ? f.medias : [];
        if (!newMediaMap[fid]) newMediaMap[fid] = [];
        
        nestedMedias.forEach(m => {
          const mid = Number(m.id);
          // Only add if not already in the map for this folder
          if (!newMediaMap[fid].some(existing => existing.id === mid)) {
            newMediaMap[fid].push({
              ...m,
              id: mid,
              isFolder: false,
              name: m.caption_vi || m.caption_en || m.file_name || m.name || `Media ${m.id}`,
              parentId: fid,
              size: m.file_size ? `${Math.round(m.file_size / 1024)} KB` : (m.size || '—'),
              type: m.mime_type,
              url: m.urls?.thumbnail || m.urls?.medium || m.urls?.original || m.url || null,
            });
          }
        });
      });

      setFolders(parsedFolders);
      setMediaMap(newMediaMap);
    } catch (e) {
      console.error('Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);
