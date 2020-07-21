import { Fragment, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

interface Props {
  logs: string[];
}

export default function Logs(props: Props): h.JSX.Element {
  const anchorEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (anchorEl.current === null) {
      return;
    }
    anchorEl.current.scrollIntoView(false);
  }, [props.logs]);

  return (
    <Fragment>
      <Box
        style={{
          paddingRight: '16px',
          paddingLeft: '16px',
          backgroundColor: 'rgb(48, 48, 48)',
        }}
      >
        {props.logs &&
          props.logs.map((v) => (
            <Typography
              component={v === '\n' ? 'p' : 'span'}
              style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {v}
            </Typography>
          ))}
        <div ref={anchorEl} />
      </Box>
    </Fragment>
  );
}
