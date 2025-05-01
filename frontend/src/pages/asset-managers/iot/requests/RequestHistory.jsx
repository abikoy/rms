import React from 'react';
import DashboardLayout from '../../../../components/DashboardLayout';
import RequestHistory from '../../../../components/RequestHistory';

const IOTRequestHistory = () => {
  return (
    <DashboardLayout>
      <RequestHistory
        role="iot_asset_manager"
        title="IOT Asset Manager - Request History"
      />
    </DashboardLayout>
  );
};

export default IOTRequestHistory;
