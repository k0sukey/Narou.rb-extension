import { Component, Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

interface State {
  webUiUrl: string;
  webSocketUrl: string;
}

const initialState: State = {
  webUiUrl: 'http://localhost:33000',
  webSocketUrl: 'ws://localhost:33001',
};

export default class App extends Component<{}, State> {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    chrome.storage.local.get(initialState, (items) => {
      this.setState({
        webUiUrl: items.webUiUrl,
        webSocketUrl: items.webSocketUrl,
      });
    });
  }

  handleChangeWebUiUrl(ev: any) {
    chrome.storage.local.set({ webUiUrl: ev.target.value });
  }

  handleChangeWebSocketUrl(ev: any) {
    chrome.storage.local.set({ webSocketUrl: ev.target.value });
  }

  render() {
    const { webUiUrl, webSocketUrl } = this.state;
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
          <Container
            maxWidth="sm"
            style={{ marginTop: '16px', marginBottom: '16px' }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  Narou.rb WEB UI / WebSocket の URL を設定してください。
                  デフォルトの URL は以下の通りとなります。
                  <dl>
                    <dt>WEB UI</dt>
                    <dd>http://localhost:33000</dd>
                    <dt>WebSocket</dt>
                    <dd>ws://localhost:33001</dd>
                  </dl>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="web-ui"
                  type="url"
                  label="WEB UI URL"
                  placeholder="http://localhost:33000"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  defaultValue={webUiUrl}
                  onChange={this.handleChangeWebUiUrl}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="web-socket"
                  type="url"
                  label="WEB SOCKET URL"
                  placeholder="ws://localhost:33001"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  defaultValue={webSocketUrl}
                  onChange={this.handleChangeWebSocketUrl}
                />
              </Grid>
            </Grid>
          </Container>
        </ThemeProvider>
      </Fragment>
    );
  }
}
