import React from 'react';
import { Stack, Breadcrumbs, Link, InputAdornment, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconArrowLeft, IconArrowRight, IconArrowUp, IconChevronRight, IconHome, IconSearch, IconRefresh } from '@tabler/icons-react';
import { Topbar, NBtn, AddrBar, SBar } from '../../utils/styles';

export default function GalleryTopbar({ crumbs, go, goBack, goFwd, goUp, hi, hist, query, setQuery, fetchData }) {
  const theme = useTheme();
  return (
    <Topbar>
      <Stack direction="row" spacing={0.25}>
        <NBtn size="small" onClick={goBack} disabled={hi === 0}>
          <IconArrowLeft size={16} />
        </NBtn>
        <NBtn size="small" onClick={goFwd} disabled={hi >= hist.length - 1}>
          <IconArrowRight size={16} />
        </NBtn>
        <NBtn size="small" onClick={goUp} disabled={!crumbs[crumbs.length - 1]?.id}>
          <IconArrowUp size={16} />
        </NBtn>
      </Stack>

      <AddrBar>
        <Breadcrumbs separator={<IconChevronRight size={12} />} sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}>
          {crumbs.map((c, i) => (
            <Link
              key={c.id}
              underline="none"
              onClick={() => go(c.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
                color: i === crumbs.length - 1 ? 'text.primary' : 'text.secondary',
                px: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {c.id === 0 && <IconHome size={13} />}
              {c.id === 0 ? 'Home' : c.name}
            </Link>
          ))}
        </Breadcrumbs>
      </AddrBar>

      <SBar
        size="small"
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={14} color={theme.palette.text.disabled} />
            </InputAdornment>
          )
        }}
      />
      <NBtn size="small" onClick={fetchData}>
        <IconRefresh size={16} />
      </NBtn>
    </Topbar>
  );
}
