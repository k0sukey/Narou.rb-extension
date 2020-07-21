import { Fragment, h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import striptags from 'striptags';
import fetch from 'unfetch';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Logs from './components/logs';
import Novels, { Novel } from './components/novels';
import { makeDateString } from './utils/make-date-string';

export default function App(): h.JSX.Element {
  const [logs, setLogs] = useState<string[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [reloadRef, setReload] = useState<number>(0);

  useEffect(() => {
    chrome.storage.local.get('webSocketUrl', (items) => {
      const ws = new WebSocket(items.webSocketUrl);
      ws.onerror = (ev: Event) => {
        setLogs((logs_) => [
          ...logs_,
          'Narou.rb へ接続できませんでした。',
          '\n',
          '　1. WEB UI / WebSocket の URL が誤っている可能性があります。拡張機能のオプションから URL の設定をご確認ください',
          '\n',
          '　2. Narou.rb WEB UI が起動していない可能性があります。この拡張機能のは Narou.rb WEB UI が起動していないと利用できません',
          '\n',
        ]);
      };
      ws.onmessage = (ev: MessageEvent) => {
        let json: any;
        try {
          json = JSON.parse(ev.data);
          if (json['table.reload']) {
            setReload(reloadRef + 1);
          }
          if (json.echo === undefined) {
            return;
          }
        } catch (e) {
          return;
        }
        setLogs((logs_) => [...logs_, striptags(json.echo.body)]);
      };
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get('webUiUrl', async (items) => {
      const res = await fetch(
        `${
          items.webUiUrl
        }/api/list?view_frozen=true&view_nonfrozen=true&_=${Date.now()}`,
        {
          method: 'GET',
        },
      );
      const json = await res.json();
      const novels_ = json.data.map((v: any) => {
        return {
          id: v.id,
          title: v.title,
          author: v.author,
          status: v.status,
          source: v.toc_url,
          latest: makeDateString(v.general_lastup),
          update: makeDateString(v.last_update),
        };
      });
      setNovels(novels_);
    });
  }, [reloadRef]);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" style={{ width: '480px', padding: 0 }}>
          <Grid container>
            <Grid
              item
              xs={12}
              style={{
                height: '100px',
                overflowY: 'scroll',
              }}
            >
              <Logs logs={logs} />
            </Grid>
            <Grid item xs={12}>
              <Novels novels={novels} />
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </Fragment>
  );
}
