import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, Typography, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { navContext, dataContext, authContext } from '@/context';
import { MilvusService } from '@/http';
import CustomSelector from '@/components/customSelector/CustomSelector';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import icons from '../icons/Icons';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.common.black,
    paddingRight: theme.spacing(1),
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    height: 48,
  },
  contentWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing(1.5),
    flex: 1,
    height: 48,
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    marginRight: theme.spacing(1),
    width: '20px',
  },
  addressWrapper: {
    display: 'flex',
    alignItems: 'center',

    '& .text': {
      marginRight: theme.spacing(2),

      '& .address': {
        fontSize: '12px',
        lineHeight: 1.3,
        color: '#545454',
      },

      '& .status': {
        fontSize: '11px',
        lineHeight: 1.3,
        color: '#1ba954',
      },
    },
  },
  database: {
    transform: 'translateY(-4px)',
    width: theme.spacing(16),
    marginRight: theme.spacing(2),
    // make the label of the selector top = 4px
    '& .MuiInputLabel-root': {
      top: '4px',
    },
  },
}));

const Header: FC = () => {
  const classes = useStyles();
  const { navInfo } = useContext(navContext);
  const { database, databases, setDatabase, loading } = useContext(dataContext);
  const { authReq, logout } = useContext(authContext);
  const { address, username } = authReq;
  const navigate = useNavigate();

  const { t: commonTrans } = useTranslation();
  const statusTrans = commonTrans('status');
  const { t: dbTrans } = useTranslation('database');
  const BackIcon = icons.back;
  const LogoutIcon = icons.logout;
  const Avatar = icons.avatar;

  const handleBack = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    logout();
  };

  const useDatabase = async (database: string) => {
    await MilvusService.useDatabase({ database });
  };

  const dbOptions = databases.map(d => ({ value: d.name, label: d.name }));
  const isLoadingDb = dbOptions.length === 0;

  return (
    <header className={classes.header}>
      <div className={classes.contentWrapper}>
        <div className={classes.navigation}>
          {navInfo.backPath !== '' && (
            <BackIcon
              classes={{ root: classes.icon }}
              onClick={() => handleBack(navInfo.backPath)}
            />
          )}
          {navInfo.showDatabaseSelector &&
            (!isLoadingDb ? (
              <CustomSelector
                label={dbTrans('database')}
                value={database}
                onChange={async (e: { target: { value: unknown } }) => {
                  const database = e.target.value as string;
                  await useDatabase(database);
                  setDatabase(database);

                  // if url contains databases, go to the database page
                  if (window.location.hash.includes('databases')) {
                    navigate(`/databases/${database}`);
                  }
                }}
                options={dbOptions}
                variant="filled"
                wrapperClass={classes.database}
                disabled={loading}
              />
            ) : (
              <StatusIcon type={LoadingType.CREATING} />
            ))}

          <Typography variant="h5" color="textPrimary">
            {navInfo.navTitle}
          </Typography>
          {navInfo.extra}
        </div>

        <div className={classes.addressWrapper}>
          <div className="text">
            <Typography className="address">{address}</Typography>
            <Typography className="status">{statusTrans.running}</Typography>
          </div>
          {username && (
            <Tooltip title={username}>
              <div>
                <Avatar classes={{ root: classes.icon }} />
              </div>
            </Tooltip>
          )}
          <Tooltip title={''}>
            <div>
              <LogoutIcon
                classes={{ root: classes.icon }}
                onClick={handleLogout}
              />
            </div>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default Header;
