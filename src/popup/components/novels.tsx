import { Fragment, h } from 'preact';
import React from 'preact/compat';
import { useState } from 'preact/hooks';
import fetch from 'unfetch';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AddToHomeScreenIcon from '@material-ui/icons/AddToHomeScreen';
import DeleteIcon from '@material-ui/icons/Delete';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import HomeIcon from '@material-ui/icons/Home';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import KitchenIcon from '@material-ui/icons/Kitchen';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SendIcon from '@material-ui/icons/Send';
import SettingsIcon from '@material-ui/icons/Settings';
import SyncIcon from '@material-ui/icons/Sync';

export interface Novel {
  id: string;
  title: string;
  author: string;
  status: string;
  source: string;
  latest: number;
  update: number;
}

interface Props {
  novels: Novel[];
}

type Order = 'asc' | 'desc';
type OrderBy = 'latest' | 'update' | 'title' | 'author';

interface EnhancedTableHeadProps {
  order: Order;
  orderBy: OrderBy;
  changeSort: (orderBy: OrderBy) => void;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { order, orderBy, changeSort } = props;
  const handleSort = (orderBy_: OrderBy) => {
    changeSort(orderBy_);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ paddingRight: '16px' }}>
          <TableSortLabel
            active={orderBy === 'latest'}
            direction={order}
            onClick={() => handleSort('latest')}
          >
            <Typography variant="caption" component="p" color="textPrimary">
              最新話掲載日
            </Typography>
          </TableSortLabel>
          <TableSortLabel
            active={orderBy === 'update'}
            direction={order}
            onClick={() => handleSort('update')}
          >
            <Typography variant="caption" component="p" color="textSecondary">
              更新日
            </Typography>
          </TableSortLabel>
        </TableCell>
        <TableCell style={{ paddingRight: '16px', paddingLeft: 0 }}>
          <TableSortLabel
            active={orderBy === 'title'}
            direction={order}
            onClick={() => handleSort('title')}
          >
            <Typography variant="caption" component="p" color="textPrimary">
              タイトル
            </Typography>
          </TableSortLabel>
          <TableSortLabel
            active={orderBy === 'author'}
            direction={order}
            onClick={() => handleSort('author')}
          >
            <Typography variant="caption" component="p" color="textSecondary">
              著者
            </Typography>
          </TableSortLabel>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
}

function desc<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort<T>(array: T[], cmp: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getSorting<K extends OrderBy>(
  order: Order,
  orderBy: K,
): (
  a: { [key in K]: number | string },
  b: { [key in K]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

export default function Novels(props: Props): h.JSX.Element {
  const [id, setId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<
    'latest' | 'update' | 'title' | 'author'
  >('latest');
  const [page, setPage] = useState<number>(0);
  const rowsPerPage = 5;

  const handleSort = (orderBy_: OrderBy) => {
    const isDesc = orderBy === orderBy_ && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(orderBy_);
  };

  const handlePagination = (event: unknown, page_: number) => {
    setPage(page_);
  };

  const handleHome = () => {
    chrome.storage.local.get('webUiUrl', async (items) => {
      chrome.tabs.create({ url: items.webUiUrl });
    });
  };

  const handleSync = (id = '') => {
    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      if (id !== '') {
        formData.append('ids[]', id);
        formData.append('force', 'true');
      }

      await fetch(`${items.webUiUrl}/api/update`, {
        method: 'POST',
        body: formData,
      });
    });
  };

  const handleFolder = (id: string) => {
    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      formData.append('ids[]', id);

      await fetch(`${items.webUiUrl}/api/folder`, {
        method: 'POST',
        body: formData,
      });
    });
  };

  const handleMenu = (ev: MouseEvent, id_: string) => {
    setId(id_);
    setAnchorEl(ev.target as HTMLButtonElement);
  };

  const handleCloseMenu = () => {
    setId(null);
    setAnchorEl(null);
  };

  const handleSend = () => {
    setAnchorEl(null);

    if (id === null) {
      return;
    }

    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      formData.append('ids[]', id);

      await fetch(`${items.webUiUrl}/api/send`, {
        method: 'POST',
        body: formData,
      });
    });
  };

  const handleConvert = () => {
    setAnchorEl(null);

    if (id === null) {
      return;
    }

    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      formData.append('ids[]', id);

      await fetch(`${items.webUiUrl}/api/convert`, {
        method: 'POST',
        body: formData,
      });
    });
  };

  const handleFreeze = () => {
    setAnchorEl(null);

    if (id === null) {
      return;
    }

    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      formData.append('ids[]', id);

      await fetch(`${items.webUiUrl}/api/freeze`, {
        method: 'POST',
        body: formData,
      });
    });
  };

  const handleDelete = () => {
    setAnchorEl(null);

    if (id === null) {
      return;
    }

    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      formData.append('ids[]', id);
      formData.append('with_file', 'false');

      await fetch(`${items.webUiUrl}/api/remove`, {
        method: 'POST',
        body: formData,
      });
    });
  };

  const handleOptions = () => {
    chrome.tabs.create({
      url: 'chrome://extensions/?options=' + chrome.runtime.id,
    });
  };

  const handleSource = (source: string) => {
    chrome.tabs.create({ url: source });
  };

  return (
    <Fragment>
      <Paper elevation={0} variant="outlined" style={{ border: 0 }} square>
        <Toolbar>
          <Typography
            variant="subtitle1"
            component="h1"
            style={{ flex: '1 1 100%' }}
          >
            <Link href="#" color="textPrimary" underline="none">
              <Avatar
                style={{
                  display: 'inline-flex',
                  width: '24px',
                  height: '24px',
                  marginRight: '8px',
                  fontSize: '0.65rem',
                }}
              >
                な
              </Avatar>
              Narou.rb extension
            </Link>
          </Typography>

          <Box style={{ display: 'inline-flex' }}>
            <IconButton
              size="small"
              style={{ marginRight: '8px' }}
              onClick={handleHome}
            >
              <HomeIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              style={{ marginRight: '8px' }}
              onClick={handleOptions}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleSync()}>
              <SyncIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
        <Table size="small">
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            changeSort={handleSort}
          />
          <TableBody>
            {(() => {
              const list = stableSort(
                props.novels,
                getSorting(order, orderBy),
              ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

              const result = list.map((row) => (
                <TableRow style={{ height: '53px' }}>
                  <TableCell style={{ width: '133px', paddingRight: '8px' }}>
                    <Typography
                      variant="caption"
                      component="p"
                      color="textPrimary"
                    >
                      {row.latest}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="p"
                      color="textSecondary"
                    >
                      {row.update}
                    </Typography>
                  </TableCell>
                  <TableCell
                    style={{
                      width: '232px',
                      paddingRight: '8px',
                      paddingLeft: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="p"
                      color="textPrimary"
                      style={{
                        width: '224px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Link
                        href="#"
                        color="textPrimary"
                        underline="hover"
                        onClick={() => handleSource(row.source)}
                      >
                        {row.title}
                      </Link>
                    </Typography>
                    <Typography
                      variant="caption"
                      component="p"
                      color="textSecondary"
                      style={{
                        width: '224px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.author}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box style={{ display: 'inline-flex' }}>
                      <IconButton
                        size="small"
                        style={{ marginRight: '2px' }}
                        onClick={() => handleFolder(row.id)}
                      >
                        <FolderOpenIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSync(row.id)}
                      >
                        <SyncIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        style={{ marginRight: '2px' }}
                        onClick={(ev: any) => handleMenu(ev, row.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ));

              for (let i = list.length; i < rowsPerPage; i++) {
                result.push(
                  <TableRow style={{ height: '53px' }}>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>,
                );
              }
              return result;
            })()}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[]}
                count={props.novels.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handlePagination}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={handleCloseMenu}
        keepMounted
      >
        <MenuItem onClick={handleSend}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">端末へ送信</Typography>
        </MenuItem>
        <MenuItem onClick={handleConvert}>
          <ListItemIcon>
            <ImportContactsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">電子書籍へ変換</Typography>
        </MenuItem>
        <MenuItem onClick={handleFreeze}>
          <ListItemIcon>
            <KitchenIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">凍結（解凍）</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">削除</Typography>
        </MenuItem>
      </Menu>
    </Fragment>
  );
}
