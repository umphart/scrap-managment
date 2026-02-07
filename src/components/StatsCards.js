import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';

const StatsCards = ({ stats, isMobile }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={6} sm={4}>
        <Card sx={{ 
          borderRadius: 3,
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          }
        }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} sx={{ mb: 1 }}>
              {stats.total}
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} sx={{ opacity: 0.9 }}>
              Total Products
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4}>
        <Card sx={{ 
          borderRadius: 3,
          bgcolor: 'warning.main',
          color: 'warning.contrastText',
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          }
        }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} sx={{ mb: 1 }}>
              {stats.withDescription}
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} sx={{ opacity: 0.9 }}>
              With Description
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={4}>
        <Card sx={{ 
          borderRadius: 3,
          bgcolor: 'info.main',
          color: 'info.contrastText',
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          }
        }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} sx={{ mb: 1 }}>
              {stats.recentlyAdded}
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} sx={{ opacity: 0.9 }}>
              Recent (7 days)
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatsCards;