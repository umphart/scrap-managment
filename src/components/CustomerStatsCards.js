import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  People as PeopleIcon,
  PhoneDisabled as PhoneDisabledIcon,
  PhoneEnabled as PhoneEnabledIcon,
} from '@mui/icons-material';

const CustomerStatsCards = ({ stats, isMobile }) => {
  const theme = useTheme();
  
  const statCards = [
    {
      title: 'Total Customers',
      value: stats.total,
      color: 'primary',
      icon: <PeopleIcon sx={{ fontSize: isMobile ? 40 : 50 }} />,
    },
    {
      title: 'Recent (7 days)',
      value: stats.recent,
      color: 'secondary',
      icon: <AccountIcon sx={{ fontSize: isMobile ? 40 : 50 }} />,
    },
    {
      title: 'No Phone',
      value: stats.withoutPhone,
      color: 'warning',
      icon: <PhoneDisabledIcon sx={{ fontSize: isMobile ? 40 : 50 }} />,
    },
    {
      title: 'With Phone',
      value: stats.total - stats.withoutPhone,
      color: 'success',
      icon: <PhoneEnabledIcon sx={{ fontSize: isMobile ? 40 : 50 }} />,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {statCards.map((stat, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Card sx={{ 
            borderRadius: 3,
            bgcolor: `${stat.color}.main`,
            color: `${stat.color}.contrastText`,
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            }
          }}>
            <CardContent sx={{ 
              p: isMobile ? 2 : 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
            }}>
              {stat.icon}
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                fontWeight={800} 
                sx={{ 
                  mt: 1,
                  mb: 0.5,
                  textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`,
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 500,
                }}
              >
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CustomerStatsCards;