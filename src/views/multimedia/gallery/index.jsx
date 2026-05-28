import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Pagination, useMediaQuery } from '@mui/material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconHome } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';

import useGallery from '../../../hooks/useGallery';
import { itemKey } from '../../../utils/utils';
import { TreeItem } from '../../../components/multimedia/GalleryComponents';
import GalleryTopbar from '../../../components/multimedia/GalleryTopbar';
import GallerySubbar from '../../../components/multimedia/GallerySubbar';
import GalleryContent from '../../../components/multimedia/GalleryContent';
import BulkDialogs from '../../../components/multimedia/BulkDialogs';
import GalleryDialogs from '../../../components/multimedia/GalleryDialogs';
import MediaViewer from '../../../components/multimedia/MediaViewer';

import { Shell, SidebarContainer as Sidebar, SbLabel, SbItem, StatusBar } from '../../../utils/styles';

export default function Gallery() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const g = useGallery();

  const contentFolderIds = g.listed.filter((i) => i.isFolder).map((i) => `f-${i.id}`);
  const sidebarRootIds = g.sidebarRoots.map((f) => `f-${f.id}`);

  return (
    <MainCard content={false}>
      <Shell>
        {/* Topbar */}
        <GalleryTopbar
          crumbs={g.crumbs}
          go={g.go}
          goBack={g.goBack}
          goFwd={g.goFwd}
          goUp={g.goUp}
          hi={g.hi}
          hist={g.hist}
          query={g.query}
          setQuery={g.setQuery}
          fetchData={g.fetchData}
        />

        {/* SubBar */}
        <GallerySubbar
          selectMode={g.selectMode}
          reorderMode={g.reorderMode}
          setReorderMode={g.setReorderMode}
          uploadTask={g.uploadTask}
          openDlg={g.openDlg}
          handleUpload={g.handleUpload}
          toggleSelectMode={g.toggleSelectMode}
          toggleSelectAll={g.toggleSelectAll}
          allSelected={g.allSelected}
          someSelected={g.someSelected}
          selected={g.selected}
          setBulkMoveDest={g.setBulkMoveDest}
          setBulkDlg={g.setBulkDlg}
          mediaFilter={g.mediaFilter}
          setMediaFilter={g.setMediaFilter}
          setPage={g.setPage}
          view={g.view}
          setView={g.setView}
          theme={theme}
        />

        {/* Body */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── Sidebar — DndContext riêng cho root-level folder reorder ── */}
          {!isMobile && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={g.handleSidebarDragEnd}>
              <Sidebar>
                <SbLabel>Navigation</SbLabel>
                <SbItem isactive={String(g.cid === 0)} onClick={() => g.go(0)}>
                  <IconHome size={14} />
                  <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>Home</Typography>
                </SbItem>

                <SbLabel sx={{ mt: 0.5 }}>Folders</SbLabel>
                <SortableContext items={sidebarRootIds} strategy={verticalListSortingStrategy}>
                  {g.sidebarRoots.map((f) => (
                    <TreeItem
                      key={f.id}
                      folder={f}
                      level={0}
                      cid={g.cid}
                      folders={g.folders}
                      onNav={g.go}
                      expanded={g.expanded}
                      setExpanded={g.setExpanded}
                      sortable={g.reorderMode}
                    />
                  ))}
                </SortableContext>
              </Sidebar>
            </DndContext>
          )}

          {/* ── Content — DndContext riêng cho folder reorder trong cid ── */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={g.handleContentDragEnd}>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, background: theme.palette.background.paper }}>
              <GalleryContent
                loading={g.loading}
                listed={g.listed}
                view={g.view}
                query={g.query}
                reorderMode={g.reorderMode}
                selectMode={g.selectMode}
                selected={g.selected}
                allSelected={g.allSelected}
                someSelected={g.someSelected}
                contentFolderIds={contentFolderIds}
                go={g.go}
                setViewItem={g.setViewItem}
                toggleSelect={g.toggleSelect}
                toggleSelectAll={g.toggleSelectAll}
                openDlg={g.openDlg}
              />
            </Box>
          </DndContext>
        </Box>

        {/* Status bar */}
        <StatusBar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="inherit">{g.listed.length} items</Typography>
            {g.selectMode && g.selected.size > 0 ? (
              <Typography variant="inherit" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {g.selected.size} selected
              </Typography>
            ) : (
              <Typography variant="inherit" sx={{ opacity: 0.45 }}>
                {g.cid === 0 ? 'Click a folder to open it' : 'Hover an item to rename, move or delete'}
              </Typography>
            )}
          </Box>
          {g.totalPages > 1 && (
            <Pagination count={g.totalPages} page={g.page} onChange={(_, v) => g.setPage(v)} size="small" color="primary" shape="rounded" />
          )}
        </StatusBar>
      </Shell>

      {/* Dialogs */}
      <GalleryDialogs
        dlg={g.dlg}
        closeDlg={g.closeDlg}
        target={g.target}
        folderNames={g.folderNames}
        setFolderNames={g.setFolderNames}
        doCreate={g.doCreate}
        renameVal={g.renameVal}
        setRenameVal={g.setRenameVal}
        doRename={g.doRename}
        doDelete={g.doDelete}
        moveDestId={g.moveDestId}
        setMoveDestId={g.setMoveDestId}
        doMove={g.doMove}
        folders={g.folders}
      />

      <BulkDialogs
        bulkDlg={g.bulkDlg}
        setBulkDlg={g.setBulkDlg}
        bulkLoading={g.bulkLoading}
        selected={g.selected}
        selectedItems={g.selectedItems}
        folders={g.folders}
        bulkMoveDest={g.bulkMoveDest}
        setBulkMoveDest={g.setBulkMoveDest}
        doBulkDelete={g.doBulkDelete}
        doBulkMove={g.doBulkMove}
      />

      <MediaViewer item={g.viewItem} onClose={() => g.setViewItem(null)} />
    </MainCard>
  );
}
