import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AssetRegistrationForm from '../../../components/AssetRegistrationForm';

const AddIoTAsset = () => {
  return (
    <DashboardLayout>
      <AssetRegistrationForm assetManagerType="iot_asset_manager" />
    </DashboardLayout>
  );
};

export default AddIoTAsset;
