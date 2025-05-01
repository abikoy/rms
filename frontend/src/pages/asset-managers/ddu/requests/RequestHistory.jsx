import React from 'react';
import DashboardLayout from '../../../../components/DashboardLayout';
import RequestHistory from '../../../../components/RequestHistory';

const DDURequestHistory = () => {
  return (
    <DashboardLayout>
      <RequestHistory
        role="ddu_asset_manager"
        title="DDU Asset Manager - Request History"
      />
    </DashboardLayout>
  );
};

export default DDURequestHistory;
