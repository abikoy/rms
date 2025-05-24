import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Badge,
    Divider,
    Typography
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';

const ResourceSidebar = ({ selectedView, onViewChange, resourceCounts }) => {
    const views = [
        {
            id: 'all',
            label: 'All Resources',
            icon: <InventoryIcon />,
            count: resourceCounts.all || 0
        },
        {
            id: 'expired',
            label: 'Expired Resources',
            icon: <ErrorIcon color="error" />,
            count: resourceCounts.expired || 0
        },
        {
            id: 'expiring-soon',
            label: 'Expiring Soon',
            icon: <WarningIcon color="warning" />,
            count: resourceCounts.expiringSoon || 0
        },
        {
            id: 'active',
            label: 'Active Resources',
            icon: <TimeIcon color="success" />,
            count: resourceCounts.active || 0
        }
    ];

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                width: { xs: '100%', md: 280 },
                borderRight: { xs: 'none', md: '1px solid' },
                borderBottom: { xs: '1px solid', md: 'none' },
                borderColor: 'divider',
                height: { xs: 'auto', md: '100%' },
                bgcolor: 'background.default',
                position: { xs: 'sticky', md: 'static' },
                top: 0,
                zIndex: 1100,
                mb: { xs: 2, md: 0 }
            }}
        >
            <Box sx={{ 
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                        fontWeight: 500
                    }}
                >
                    Resource Views
                </Typography>
            </Box>
            <Divider />
            <List sx={{ 
                py: { xs: 0.5, sm: 1 }
            }}>
                {views.map((view) => (
                    <ListItem 
                        key={view.id} 
                        disablePadding 
                        sx={{ 
                            mb: { xs: 0.5, sm: 1 }
                        }}
                    >
                        <ListItemButton
                            selected={selectedView === view.id}
                            onClick={() => onViewChange(view.id)}
                            sx={{
                                py: { xs: 0.75, sm: 1 },
                                px: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon 
                                sx={{ 
                                    minWidth: { xs: 35, sm: 40 },
                                    color: selectedView === view.id ? 'primary.main' : 'text.secondary'
                                }}
                            >
                                <Badge 
                                    badgeContent={view.count} 
                                    color="primary"
                                    sx={{ 
                                        '& .MuiBadge-badge': {
                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                            minWidth: { xs: 14, sm: 16 },
                                            height: { xs: 14, sm: 16 },
                                            padding: { xs: '0 3px', sm: '0 4px' }
                                        }
                                    }}
                                >
                                    {React.cloneElement(view.icon, { 
                                        sx: { fontSize: { xs: 18, sm: 22 } }
                                    })}
                                </Badge>
                            </ListItemIcon>
                            <ListItemText 
                                primary={view.label}
                                primaryTypographyProps={{
                                    sx: {
                                        fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                                        color: selectedView === view.id ? 'primary.main' : 'text.primary',
                                        fontWeight: selectedView === view.id ? 500 : 400
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ResourceSidebar;
