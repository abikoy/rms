import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    Button,
    Tooltip,
    Divider
} from '@mui/material';
import { 
    AssignmentReturn as ReturnIcon,
    SwapHoriz as TransferIcon,
    Description as DescriptionIcon,
    LocalOffer as PriceIcon,
    Inventory as InventoryIcon,
    Category as TypeIcon
} from '@mui/icons-material';

const ResourceCard = ({ resource, onReturn, onTransfer, onToggleStatus, userRole }) => {
    const resourceDetails = resource.resource || {};
    
    // Don't destructure type as we need to access it directly from resourceDetails
    const {
        name,
        status,
        description,
        serialNumber,
        unitPrice
    } = resourceDetails;

    // Calculate total assigned quantity from items array
    const assignedQuantity = resource.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const formattedType = resourceDetails.type === 'non_fixed_assets' ? 'Non-Fixed Asset' : 'Fixed Asset';
    
    // Format unit price with proper validation
    const formattedPrice = (() => {
        // Make sure unitPrice object exists
        if (!unitPrice || typeof unitPrice !== 'object') {
            return 'N/A';
        }

        // Get birr and cents, defaulting to 0 if undefined
        const birr = typeof unitPrice.birr === 'number' ? unitPrice.birr : 0;
        const cents = typeof unitPrice.cents === 'number' ? unitPrice.cents : 0;

        // Format with proper decimal places
        return `${birr}.${cents.toString().padStart(2, '0')} Birr`;
    })();

    // Check if resource is expired
    const isExpired = resourceDetails.type === 'non_fixed_assets' && resource.items?.[0]?.expirationDate
        ? new Date() > new Date(resource.items[0].expirationDate)
        : false;

    // Determine status color and clickability
    const statusColor = isExpired ? 'error' : (resource.isAvailable ? 'info' : 'success');
    const canToggleStatus = !isExpired && ['school_dean', 'department_head'].includes(userRole);

    return (
        <Card 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8]
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: 2 
                }}>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            fontWeight: 600,
                            color: (theme) => theme.palette.primary.main
                        }}
                    >
                        {name || 'Unnamed Resource'}
                    </Typography>
                    <Tooltip title={canToggleStatus ? 'Click to toggle availability' : ''}>
                        <Chip 
                            label={resource.isAvailable ? 'Available' : 'Assigned'}
                            color={statusColor}
                            size="small"
                            sx={{ 
                                borderRadius: 1,
                                cursor: canToggleStatus ? 'pointer' : 'default',
                                '&:hover': canToggleStatus ? {
                                    opacity: 0.8
                                } : {}
                            }}
                            onClick={canToggleStatus ? () => onToggleStatus(resource._id) : undefined}
                        />
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TypeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                        {formattedType}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InventoryIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                        Assigned Quantity: {assignedQuantity}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PriceIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                        Unit Price: {formattedPrice}
                    </Typography>
                </Box>

                {serialNumber && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Serial Number: {serialNumber}
                    </Typography>
                )}

                {description && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                        Assigned by: {resource.assignedBy?.fullName || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                        Date: {resource.assignedAt ? new Date(resource.assignedAt).toLocaleDateString() : 'Unknown'}
                    </Typography>
                    {resourceDetails.type === 'non_fixed_assets' && resource.items?.[0]?.expirationDate && (
                        <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ 
                                color: (() => {
                                    const now = new Date();
                                    const expDate = new Date(resource.items[0].expirationDate);
                                    const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                                    
                                    if (daysUntilExpiry <= 0) return 'error.main';  // Expired
                                    if (daysUntilExpiry <= 7) return 'warning.main'; // About to expire
                                    return 'success.main';  // Good condition
                                })(),
                                fontWeight: 'bold'
                            }}
                        >
                            Expires: {new Date(resource.items[0].expirationDate).toLocaleDateString()}
                            {(() => {
                                const now = new Date();
                                const expDate = new Date(resource.items[0].expirationDate);
                                const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                                
                                if (daysUntilExpiry <= 0) return ' (EXPIRED)';
                                if (daysUntilExpiry <= 7) return ` (Expires in ${daysUntilExpiry} days)`;
                                return '';
                            })()}
                        </Typography>
                    )}
                </Box>
            </CardContent>

            <CardActions 
                sx={{ 
                    justifyContent: 'flex-end', 
                    p: 2,
                    gap: 1,
                    bgcolor: (theme) => theme.palette.grey[50],
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}
            >
                {!isExpired ? (
                    <>
                        <Tooltip title="Return this resource" arrow>
                            <Button
                                variant="contained"
                                onClick={() => onReturn(resource)}
                                startIcon={<ReturnIcon />}
                                sx={{ 
                                    bgcolor: (theme) => theme.palette.error.main,
                                    color: 'white',
                                    '&:hover': { 
                                        bgcolor: (theme) => theme.palette.error.dark,
                                    }
                                }}
                            >
                                Return
                            </Button>
                        </Tooltip>
                        <Tooltip title="Transfer this resource" arrow>
                            <Button
                                variant="contained"
                                onClick={() => onTransfer(resource)}
                                startIcon={<TransferIcon />}
                                sx={{ 
                                    bgcolor: (theme) => theme.palette.info.main,
                                    color: 'white',
                                    '&:hover': { 
                                        bgcolor: (theme) => theme.palette.info.dark,
                                    }
                                }}
                            >
                                Transfer
                            </Button>
                        </Tooltip>
                    </>
                ) : (
                    <Chip
                        label="Resource Expired"
                        color="error"
                        variant="outlined"
                        sx={{ 
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            py: 1
                        }}
                    />
                )}
            </CardActions>
        </Card>
    );
};

export default ResourceCard;
